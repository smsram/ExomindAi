// All Popups
//Profile
const userDetailsBasic = document.querySelector('.user-details-basic');
const userDetailsMore = document.querySelector('.user-details-more');

userDetailsBasic.addEventListener('click', function() {
    if (userDetailsMore.style.display === 'flex') {
        userDetailsMore.style.opacity = '0';
        setTimeout(() => {
            userDetailsMore.style.display = 'none';
        }, 500);
    } else {
        userDetailsMore.style.display = 'flex';
        setTimeout(() => {
            userDetailsMore.style.opacity = '1';
        }, 10);
    }
});

document.addEventListener('click', function(event) {
    if (!userDetailsBasic.contains(event.target) && !userDetailsMore.contains(event.target) && userDetailsMore.style.display === 'flex') {
        userDetailsMore.style.opacity = '0';
        setTimeout(() => {
            userDetailsMore.style.display = 'none';
        }, 500);
    }
});

// Profile Upload
const usersName = document.querySelector('#name');
const userProfileUpload = document.querySelector('.upload-user-profile');

usersName.addEventListener('click', function() {
    if (userProfileUpload.style.display === 'flex') {
        userProfileUpload.style.opacity = '0';
        setTimeout(() => {
            userProfileUpload.style.display = 'none';
        }, 500);
    } else {
        userProfileUpload.style.display = 'flex';
        setTimeout(() => {
            userProfileUpload.style.opacity = '1';
        }, 10);
    }
});

document.addEventListener('click', function(event) {
    if (!usersName.contains(event.target) && !userProfileUpload.contains(event.target) && userProfileUpload.style.display === 'flex') {
        userProfileUpload.style.opacity = '0';
        setTimeout(() => {
            userProfileUpload.style.display = 'none';
        }, 500);
    }
});

// Menu Bar
const menuIcon = document.querySelector('.menu-icon');
const dashboard = document.querySelector('.dashboard');

// Initial state
function initializeState() {
    if (window.innerWidth <= 900) {
        dashboard.style.left = '-14rem';
        menuIcon.style.right = '-2.2rem';
    } else {
        dashboard.style.left = '0'; // Default state for larger screens
        menuIcon.style.right = '0'; // Default state for larger screens
    }
    handleMenuIconDisplay();
}

function handleMenuIconDisplay() {
    if (window.innerWidth <= 900) {
        menuIcon.style.display = 'block';
        if (dashboard.style.left !== '0rem') {
            dashboard.style.left = '-14rem';
            menuIcon.style.right = '-2.2rem';
        }
    } else {
        menuIcon.style.display = 'none';
        dashboard.style.left = '0'; // Reset dashboard position for larger screens
        menuIcon.style.right = '0'; // Reset menu icon position for larger screens
    }
}

// Initial check and event listener for resizing
window.addEventListener('load', initializeState);
window.addEventListener('resize', initializeState);

menuIcon.addEventListener('click', function() {
    if (dashboard.style.left === '0rem') {
        dashboard.style.left = '-14rem';
        menuIcon.style.right = '-2.2rem';
    } else {
        dashboard.style.left = '0rem';
        menuIcon.style.right = '0.2rem';
    }
});

document.addEventListener('click', function(event) {
    if (!menuIcon.contains(event.target) && !dashboard.contains(event.target) && dashboard.style.left === '0rem') {
        dashboard.style.left = '-14rem';
        menuIcon.style.right = '-2.2rem';
    }
});
