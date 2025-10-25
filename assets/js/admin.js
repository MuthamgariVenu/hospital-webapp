// admin.js

// Default credentials
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  const msgEl = document.getElementById('msg');

  if (user === DEFAULT_USERNAME && pass === DEFAULT_PASSWORD) {
    // ✅ Success — redirect to dashboard
    window.location.href = '/admin/dashboard.html';
  } else {
    // ❌ Wrong credentials
    msgEl.textContent = 'Invalid username or password';
    msgEl.classList.remove('hidden');

    setTimeout(() => msgEl.classList.add('hidden'), 3000);
  }
});
