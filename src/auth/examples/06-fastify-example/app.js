import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import {
  comparePassword,
  generateToken,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = Fastify();

app.register(formbody);
app.register(cookie);
app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/',
});

// Dummy users with passwordHash for "password123"
const users = [
  {
    id: '1',
    username: 'user1',
    passwordHash:
      '$2b$12$C6UzMDM.H6dfI/f/IKcHeO8PLOH5dDlCvgvZUDLl1xB6/JEB45v/O',
    roles: ['user'],
  },
  {
    id: '2',
    username: 'admin1',
    passwordHash:
      '$2b$12$C6UzMDM.H6dfI/f/IKcHeO8PLOH5dDlCvgvZUDLl1xB6/JEB45v/O',
    roles: ['admin'],
  },
];

const findUserByUsername = (username) =>
  users.find((u) => u.username === username);
const findUserById = (id) => users.find((u) => u.id === id);

const JWT_SECRET = 'super-secret-key';

// Create auth middleware using voilajsx/appkit/auth
const authMiddlewareRaw = createAuthMiddleware({ secret: JWT_SECRET });
const adminOnlyMiddlewareRaw = createAuthorizationMiddleware(['admin'], {
  secret: JWT_SECRET,
});

// Wrap middleware to ensure async (req, reply) signature without 'done'
const authMiddleware = async (req, reply) => {
  await authMiddlewareRaw(req, reply);
};

const adminOnlyMiddleware = async (req, reply) => {
  await adminOnlyMiddlewareRaw(req, reply);
};

// Login route
app.post('/login', async (req, reply) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return reply.code(400).send('Username and password required');
  }
  const user = findUserByUsername(username);
  if (!user) return reply.code(401).send('Invalid credentials');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return reply.code(401).send('Invalid credentials');

  const token = generateToken(
    { userId: user.id, username: user.username, roles: user.roles },
    { secret: JWT_SECRET }
  );

  reply.setCookie('token', token, { httpOnly: true, path: '/' });
  return reply.redirect('/dashboard');
});

// Logout
app.get('/logout', async (req, reply) => {
  reply.clearCookie('token', { path: '/' });
  return reply.redirect('/login.html');
});

// Protected dashboard route
app.get('/dashboard', { preHandler: authMiddleware }, async (req, reply) => {
  const user = findUserById(req.user.userId);
  if (!user) return reply.code(401).send('User not found');

  const isAdmin = user.roles.includes('admin');

  return reply.type('text/html').send(`
    <h1>Welcome, ${user.username}</h1>
    <p>Your role: ${user.roles.join(', ')}</p>
    <nav>
      <a href="/dashboard">Dashboard</a><br/>
      ${isAdmin ? `<a href="/admin">Admin Panel</a><br/>` : ''}
      <a href="/logout">Logout</a>
    </nav>
  `);
});

// Admin-only route
app.get(
  '/admin',
  { preHandler: [authMiddleware, adminOnlyMiddleware] },
  async (req, reply) => {
    return reply.type('text/html').send(`
      <h1>Admin Panel</h1>
      <p>Only accessible by users with admin role.</p>
      <a href="/dashboard">Back to Dashboard</a>
    `);
  }
);

// Redirect root to login page
app.get('/', async (req, reply) => {
  return reply.redirect('/login.html');
});

// Start server
app.listen({ port: 3000 }, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
