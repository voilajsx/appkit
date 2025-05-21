// Example src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

// Get the base URL from Vite's environment variables
// Vite automatically provides this, matching what you set in vite.config.js
const basename = import.meta.env.BASE_URL;

// Debug logging - you can remove this after confirming it works
console.log('Base URL for routing:', basename);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);