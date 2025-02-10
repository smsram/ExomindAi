const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('user-submit');
const messagesContainer = document.querySelector('.messages-container');

const tempChatButton = document.querySelector('.temp-chat');
const resetTempChatButton = document.getElementById('reset-temp-chat');

let tempChatMode = false;
let storedMessages = [];

tempChatButton.classList.add(".delete-chat");

// Start temp chat
tempChatButton.addEventListener('click', () => {
  messagesContainer.innerHTML = ''; // Clear the chat UI
  storedMessages = []; // Reset stored messages
  tempChatMode = true;
  resetTempChatButton.style.display = 'block'; // Show reset button
  alert("Temperory chat started. Your chat won't be stored.");
});

// Reset temp chat and load previous chat
resetTempChatButton.addEventListener('click', async () => {
  messagesContainer.innerHTML = ''; // Clear current messages
  storedMessages = []; // Reset stored messages array
  tempChatMode = false;
  resetTempChatButton.style.display = 'none'; // Hide reset button
  await loadPreviousMessages(); // Reload previous messages
});

const username = localStorage.getItem('username');
const deleteChatButton = document.querySelector('.delete-chat');

// Delete all chat messages
deleteChatButton.addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete all your chat messages?')) {
    try {
      const response = await fetch(`https://web-production-9545.up.railway.app/delete-messages?username=${username}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Chat deleted successfully.');
        messagesContainer.innerHTML = ''; // Clear chat UI
      } else {
        alert(`Failed to delete chat: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('An error occurred while deleting the chat.');
    }
  }
});

if (!username) {
  alert('No username found. Please log in.');
  // Redirect to login or handle accordingly
}

window.onload = async function () {
  await loadPreviousMessages();
};

// Submit message
submitButton.addEventListener('click', async () => {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to the chat
  addMessage(userMessage, 'user');
  userInput.value = '';

  if (!tempChatMode) {
    // Save user message to stored messages and backend only if not in temp mode
    storedMessages.push(userMessage);
    await sendMessageToBackend(userMessage, 'user');
  }

  // Add typing indicator for bot response
  const typingIndicator = addMessage('...', 'bot');

  try {
    // Send message to the Flask bot server with conversation history
    const response = await fetch('https://flaskapp1-railway-production.up.railway.app/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: tempChatMode ? [userMessage] : storedMessages }), // Include only the current message in temp mode
    });

    const data = await response.json();
    removeTypingIndicator(typingIndicator);

    if (data.response) {
      const botResponse = processResponse(data.response);
      addMessage(botResponse, 'bot', true);

      if (!tempChatMode) {
        // Save bot response only if not in temp chat mode
        storedMessages.push(botResponse);
        await sendMessageToBackend(botResponse, 'bot');
      }
    } else {
      addMessage('Bot could not respond. Please try again later.', 'bot');
    }
  } catch (error) {
    removeTypingIndicator(typingIndicator);
    addMessage('Error connecting to the server. Please try again.', 'bot');
  }
});

// Save message to backend
async function sendMessageToBackend(message, sender) {
  try {
    await fetch('https://web-production-9545.up.railway.app/save-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message, sender }),
    });
  } catch (error) {
    console.error('Error saving message to backend:', error);
  }
}

// Load previous messages
async function loadPreviousMessages() {
  try {
    console.log(`Fetching messages for username: ${username}`);
    const response = await fetch(`https://web-production-9545.up.railway.app/get-messages?username=${username}`);
    const data = await response.json();
    console.log('Response from server:', data);

    if (data.success && data.messages.length > 0) {
      data.messages.forEach((msg) => {
        storedMessages.push(msg.message_text); // Store message text in the array
        if (msg.sender === 'bot') {
          addMessage(msg.message_text, msg.sender, true); // Allow HTML for bot responses
        } else {
          addMessage(msg.message_text, msg.sender); // Escape HTML for user messages
        }
      });
    } else {
      console.log('No messages found for the current user.');
    }
    console.log('Stored messages:', storedMessages); // Print stored messages array to the console
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text; // This escapes any HTML
  return div.innerHTML;
}

window.addEventListener('load', loadPreviousMessages);

function addMessage(text, sender, isHTML = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);

  if (isHTML) {
    messageElement.innerHTML = text; // For bot responses (HTML content allowed)
  } else {
    messageElement.textContent = text; // For plain text (user messages, previous messages)
  }

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
  return messageElement;
}

function removeTypingIndicator(element) {
  element.remove();
}

function processResponse(response) {
  // You can format the response if needed (e.g., convert URLs to clickable links)
  return response;
}


// Utility function to process bot response (formatting, code blocks, tables, etc.)
function processResponse(response) {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const tableRowRegex = /^\|.*?\|.*?\|.*?\|.*?\|/; // Detects Markdown table rows
  let codeBlocks = [];
  let processedResponse = response.replace(codeBlockRegex, (match, code) => {
    let lines = code.split("\n");
    let firstLine = lines.shift().trim();
    let remainingCode = lines.join("\n").trim();

    remainingCode = remainingCode.replace(/^\s+/gm, (match) => "\n" + match);
    codeBlocks.push(remainingCode.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));

    return `__FIRST_LINE__${firstLine}__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  processedResponse = processedResponse.replace(/^\|([\s\S]+?)\|\n\|[-\s|]+\|\n((?:\|.+?\|\n)+)/gm, (match, headerRow, bodyRows) => {
    const headers = headerRow.split("|").map(header => header.trim()).filter(Boolean);
    const rows = bodyRows.split("\n").filter(line => line.trim() !== "").map(row => {
      const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
      while (cells.length < headers.length) cells.push("");
      return `<tr>${cells.map(cell => `<td class="table-response-cells">${cell}</td>`).join("")}</tr>`;
    }).join("");

    return `
      <table class="table-response">
        <thead class="table-response-head">
          <tr class="table-response-rows">${headers.map(header => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  });

  processedResponse = processedResponse
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="code-part">$1</code>')
    .replace(/\n/g, "<br>");

  const containerDiv = document.createElement("div");
  containerDiv.innerHTML = processedResponse;

  containerDiv.innerHTML = containerDiv.innerHTML.replace(/__FIRST_LINE__(.*?)__CODE_BLOCK_(\d+)__/g, (match, firstLine, index) => {
    let codeBlock = codeBlocks[index];
    return `
      <div class="main-code-container">
        <div class="code-lang-and-copy-btn">
          <p class="code-lang">${firstLine}</p>
          <button class="copy-code-container" onclick="copyCodeToClipboard(this)">Copy Code</button>
        </div>
        <div class="code-container">
          <pre>
            <br>${codeBlock}
          </pre>
        </div>
      </div>
    `;
  });

  return containerDiv.outerHTML;
}

// Function to copy code block to clipboard
function copyCodeToClipboard(button) {
  try {
    const preElement = button.closest('.main-code-container').querySelector('pre');
    let codeContent = preElement.innerText.trim();

    const tempTextArea = document.createElement("textarea");
    tempTextArea.style.position = "fixed";
    tempTextArea.style.opacity = "0";
    tempTextArea.value = codeContent;

    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    navigator.clipboard.writeText(codeContent)
      .then(() => {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy content. Please try again.");
      })
      .finally(() => {
        document.body.removeChild(tempTextArea);
      });
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    alert("An error occurred while copying. Please try again.");
  }
}