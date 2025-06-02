/**
 * Express File Upload - @voilajsx/appkit
 * @file 04-express-upload.js
 * Simple web server with file upload
 *
 * Run: node 04-express-upload.js
 * Then visit: http://localhost:3000
 */

import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '../index.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize storage
await initStorage('local', {
  basePath: './uploads',
  baseUrl: '/files',
});
const storage = getStorage();

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await storage.upload(
      req.file.buffer,
      `uploads/${Date.now()}-${req.file.originalname}`
    );

    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        url: result.url,
        size: result.size,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List files endpoint
app.get('/files', async (req, res) => {
  const files = await storage.list('uploads/');
  res.json({ files });
});

// Get file content endpoint
app.get('/content/:filename', async (req, res) => {
  try {
    const content = await storage.get(`uploads/${req.params.filename}`);
    res.send(content);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Simple upload form
app.get('/', (req, res) => {
  res.send(`
    <h2>File Upload Demo</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required>
      <button type="submit">Upload</button>
    </form>
    <p><a href="/files">View uploaded files (JSON)</a></p>
  `);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('\n✅ Upload files through the web interface');
});
