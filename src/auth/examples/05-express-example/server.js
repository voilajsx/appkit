/**
 * Simple Express authentication with separate HTML files
 * @module @voilajsx/appkit/auth
 * @file server.js
 */

import express from 'express';
import fs from 'fs';
import {
  hashPassword,
  comparePassword,
  generateToken,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';

const app = express();
const PORT = 3000;

// Users data in memory
const users = [
  {
    id: '1',
    email: 'admin@test.com',
    name: 'Admin',
    password: 'admin123',
    roles: ['admin'],
  },
  {
    id: '2',
    email: 'user@test.com',
    name: 'User',
    password: 'user123',
    roles: ['user'],
  },
];

/**
 * Hash passwords on startup
 */
async function initUsers() {
  for (let user of users) {
    user.hashedPassword = await hashPassword(user.password, 10);
  }
  console.log('✅ Users ready: admin@test.com/admin123, user@test.com/user123');
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Auth middleware
const auth = createAuthMiddleware({
  secret: 'demo-secret',
  getToken: (req) => req.headers.authorization?.slice(7),
  onError: (error, req, res) => res.redirect('/login?error=' + error.message),
});

const adminOnly = createAuthorizationMiddleware(['admin']);

/**
 * Finds user by email
 * @param {string} email - User email
 * @returns {Object|null} User or null
 */
const findUser = (email) => users.find((u) => u.email === email) || null;

/**
 * Reads HTML file and replaces variables
 * @param {string} filename - HTML filename
 * @param {Object} vars - Variables to replace
 * @returns {string} HTML content
 */
function renderHTML(filename, vars = {}) {
  let html = fs.readFileSync(`./pages/${filename}`, 'utf8');

  // Replace variables like {{NAME}} with actual values
  Object.keys(vars).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, vars[key]);
  });

  return html;
}

/**
 * Authenticates user
 * @param {string} email - User email
 * @param {string} password - Password
 * @returns {Promise<Object>} User and token
 */
async function login(email, password) {
  const user = findUser(email);
  if (!user || !(await comparePassword(password, user.hashedPassword))) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(
    { userId: user.id, email, roles: user.roles },
    { secret: 'demo-secret', expiresIn: '1h' }
  );

  return { user, token };
}

// Routes
app.get('/', (req, res) => {
  res.send(renderHTML('home.html'));
});

app.get('/login', (req, res) => {
  const error = req.query.error || '';
  res.send(renderHTML('login.html', { ERROR: error }));
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    res.redirect('/login?error=' + error.message);
  }
});

app.get('/dashboard', (req, res) => {
  const token = req.query.token;
  if (!token) return res.redirect('/login?error=No token');

  req.headers.authorization = `Bearer ${token}`;

  auth(req, res, () => {
    const user = findUser(req.user.email);
    const adminButton = req.user.roles.includes('admin')
      ? `<a href="/admin?token=${token}" class="btn">Admin Panel</a>`
      : '';

    res.send(
      renderHTML('dashboard.html', {
        USER_NAME: user.name,
        USER_EMAIL: user.email,
        USER_ROLES: user.roles.join(', '),
        TOKEN: token,
        ADMIN_BUTTON: adminButton,
      })
    );
  });
});

app.get('/admin', (req, res) => {
  const token = req.query.token;
  if (!token) return res.redirect('/login?error=No token');

  req.headers.authorization = `Bearer ${token}`;

  auth(req, res, () => {
    adminOnly(req, res, () => {
      const usersList = users
        .map(
          (u) =>
            `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.roles.join(', ')}</td></tr>`
        )
        .join('');

      res.send(
        renderHTML('admin.html', {
          USERS_LIST: usersList,
          TOKEN: token,
        })
      );
    });
  });
});

app.get('/logout', (req, res) => res.redirect('/'));

// Start server
async function start() {
  await initUsers();
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log('📁 Structure: pages/*.html + public/style.css');
    console.log('👤 Admin: admin@test.com / admin123');
    console.log('👤 User: user@test.com / user123');
  });
}

start();
