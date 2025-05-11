// Simple vanilla JavaScript for auth demo
const API_URL = 'http://localhost:3000';

// UI Elements
const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerContainer = document.getElementById('registerContainer');
const statusMessage = document.getElementById('statusMessage');

// Dashboard elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userId = document.getElementById('userId');
const userToken = document.getElementById('userToken');
const apiResult = document.getElementById('apiResult');

// Store token in memory (in production, consider secure storage)
let authToken = null;

// Show status message
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

// Switch between login and register
document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('.form-container').classList.add('hidden');
  registerContainer.classList.remove('hidden');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  registerContainer.classList.add('hidden');
  document.querySelector('.form-container').classList.remove('hidden');
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      showDashboard(data.user);
      showStatus('Login successful!');
    } else {
      showStatus(data.message, 'error');
    }
  } catch (error) {
    showStatus('Login failed', 'error');
  }
});

// Handle registration
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      showDashboard(data.user);
      showStatus('Registration successful!');
    } else {
      showStatus(data.message, 'error');
    }
  } catch (error) {
    showStatus('Registration failed', 'error');
  }
});

// Show dashboard
function showDashboard(user) {
  authSection.classList.add('hidden');
  dashboard.classList.remove('hidden');

  userName.textContent = user.name;
  userEmail.textContent = user.email;
  userId.textContent = user.id;
  userToken.textContent = authToken;
}

// Test protected endpoint
document.getElementById('testProtected').addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_URL}/api/protected`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await response.json();
    apiResult.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    apiResult.textContent = 'Error calling protected endpoint';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  authToken = null;
  authSection.classList.remove('hidden');
  dashboard.classList.add('hidden');
  loginForm.reset();
  registerForm.reset();
  showStatus('Logged out successfully');
});
