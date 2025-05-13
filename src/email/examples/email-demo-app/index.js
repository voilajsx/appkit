// src/email/examples/email-demo-app/index.js
/**
 * Email Demo Express App
 *
 * This is a complete Express.js application demo showcasing the email module in a real-world scenario.
 * It implements a simplified e-commerce backend with user authentication and order processing flows.
 */

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import EmailService from '../05-email-service.js';

// Load environment variables
dotenv.config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database for demo purposes
const db = {
  users: [
    {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'password123', // In a real app, this would be hashed
      verified: true,
    },
  ],
  orders: [],
  resetTokens: {},
  activationTokens: {},
};

// Create and initialize the email service
const emailService = new EmailService();

// Initialize the app
async function initializeApp() {
  try {
    // Initialize email service
    await emailService.initialize({
      environment: process.env.NODE_ENV || 'development',
      templatesDir: path.join(__dirname, 'templates'),
    });

    console.log('Email service initialized');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

// API Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: 'Email, name, and password are required' });
    }

    // Check if user already exists
    if (db.users.find((user) => user.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate activation token
    const activationToken = Math.random().toString(36).substring(2, 15);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password, // In a real app, this would be hashed
      verified: false,
    };

    db.users.push(user);
    db.activationTokens[activationToken] = email;

    // Send welcome email with activation link
    await emailService.sendWelcomeEmail({
      email,
      name,
      activationToken,
    });

    res.status(201).json({
      message:
        'User registered successfully. Please check your email to activate your account.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Account activation
app.get('/api/auth/activate', (req, res) => {
  const { token } = req.query;

  if (!token || !db.activationTokens[token]) {
    return res
      .status(400)
      .json({ error: 'Invalid or expired activation token' });
  }

  const email = db.activationTokens[token];
  const user = db.users.find((user) => user.email === email);

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Activate user account
  user.verified = true;
  delete db.activationTokens[token];

  res.json({ message: 'Account activated successfully' });
});

// Password reset request
app.post('/api/auth/password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = db.users.find((user) => user.email === email);

    if (!user) {
      // Don't reveal if email exists for security reasons
      return res.json({
        message:
          'If your email is registered, a password reset link will be sent.',
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    db.resetTokens[resetToken] = {
      email,
      expires: Date.now() + 3600000, // 1 hour
    };

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken, '1 hour');

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, items, shippingAddress } = req.body;

    // Find customer
    const customer = db.users.find((user) => user.id === customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate order totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 5.99;
    const total = subtotal + tax + shipping;

    // Create order
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      status: 'pending',
    };

    db.orders.push(order);

    // Send order confirmation email
    await emailService.sendOrderConfirmationEmail(order);

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await emailService.close();
    console.log('Email connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 3000;

// Initialize the app and start the server
initializeApp()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Demo app: http://localhost:${PORT}`);
      console.log('Check emails at: http://localhost:8025');
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });
