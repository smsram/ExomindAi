// Login form
function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  fetch('https://web-production-9545.up.railway.app/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          localStorage.setItem('username', data.username);
          window.location.href = 'index.html?username=' + data.username;
      } else {
          alert(data.message);
      }
  });
}

// Signup form
function signup() {
  const username = document.getElementById('signup-username').value;
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const profileImageUrl = "https://drive.google.com/uc?id=1W2q-z1ycj3lLitAFIFiiGHnEfDHrvatn&export=download";

  fetch('https://web-production-9545.up.railway.app/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, phone, email, password, profile_image_url: profileImageUrl })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          window.location.href = 'login.html';
      } else {
          alert(data.message);
      }
  });
}

async function fetchUserName() {
const username = localStorage.getItem('username');

if (username) {
    const response = await fetch(`https://web-production-9545.up.railway.app/get-name?username=${username}`);
    const data = await response.json();

    if (data.success) {
        document.getElementById('name').innerText = data.name;
        document.getElementById('user-name').innerText = username;

        // Fetch the profile image URL
        const profileResponse = await fetch(`https://web-production-9545.up.railway.app/get-profile-image?username=${username}`);
        const profileData = await profileResponse.json();

        if (profileData.success) {
            document.getElementById('user-profile').src = profileData.profile_image_url;
        } else {
            console.error('Failed to fetch profile image:', profileData.message);
        }
    } else {
        alert(data.message);
    }
} else {
    alert('No username provided.');
}
}

window.onload = fetchUserName;

// Upload Profile
document.getElementById('profile-upload-btn').addEventListener('click', async (event) => {
event.preventDefault();
event.stopPropagation();

const fileInput = document.getElementById('fileInput');
const resultDiv = document.getElementById('result');
const userProfileIframe = document.getElementById('user-profile');

if (fileInput.files.length === 0) {
resultDiv.innerHTML = '<p style="color: red;">Please select an image to upload.</p>';
return;
}

const file = fileInput.files[0];
if (!file.type.startsWith('image/')) {
resultDiv.innerHTML = '<p style="color: red;">Only image files are allowed.</p>';
return;
}

const formData = new FormData();
formData.append('file', file);

try {
const response = await fetch('https://upload-to-drive-production.up.railway.app/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
if (data.link) {
  // Extract the file ID from the generated link
  const fileId = data.link.match(/id=([a-zA-Z0-9_-]+)/)[1];
  const previewLink = `https://drive.google.com/file/d/${fileId}/preview`;

  userProfileIframe.src = previewLink;  // Set the preview link as the iframe src
  resultDiv.innerHTML = `<p style="color: green;">Image uploaded successfully!</p>`;

  // Update the profile image URL in the database
  const username = localStorage.getItem('username');
  await fetch('https://web-production-9545.up.railway.app/update-profile-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, profile_image_url: previewLink })
  });
} else {
  resultDiv.innerHTML = '<p style="color: red;">Image upload failed.</p>';
}
} catch (error) {
console.error('Error uploading image:', error);
resultDiv.innerHTML = '<p style="color: red;">An error occurred while uploading the image.</p>';
}
});

// Logout Function
function logout() {
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
