# Simple Auth Demo

Clean Express authentication demo with separate HTML files using
`@voilajsx/appkit/auth`.

## 📁 Project Structure

```
simple-auth-demo/
├── server.js              # Main Express app
├── package.json            # Dependencies
├── pages/                  # HTML templates
│   ├── home.html          # Homepage
│   ├── login.html         # Login form
│   ├── dashboard.html     # User dashboard
│   └── admin.html         # Admin panel
└── public/
    └── style.css          # Simple styles
```

## 🚀 Setup

```bash
mkdir simple-auth-demo
cd simple-auth-demo
mkdir pages public

# Copy all files to their respective folders
npm install
npm start
```

Visit: http://localhost:3000

## 👥 Demo Accounts

- **Admin**: admin@test.com / admin123
- **User**: user@test.com / user123

## ✨ Features

- ✅ **Separate HTML files** - Clean organization
- ✅ **Simple CSS** - Clean, minimal styling
- ✅ **Template variables** - `{{USER_NAME}}` replacement
- ✅ **JWT authentication** - Token-based security
- ✅ **Role-based access** - Admin/User permissions
- ✅ **4 pages** - Home, Login, Dashboard, Admin

## 🔧 How It Works

### Authentication Flow:

1. **Login** → Validates credentials
2. **Token Generation** → Creates JWT token
3. **Protected Routes** → Middleware checks token
4. **Role Authorization** → Admin routes check roles

### Template System:

- HTML files with `{{VARIABLE}}` placeholders
- `renderHTML()` function replaces variables
- Clean separation of logic and presentation

## 📝 Key Code:

```javascript
// Template rendering
function renderHTML(filename, vars = {}) {
  let html = fs.readFileSync(`./pages/${filename}`, 'utf8');
  Object.keys(vars).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
  });
  return html;
}

// Usage
res.send(
  renderHTML('dashboard.html', {
    USER_NAME: user.name,
    USER_EMAIL: user.email,
  })
);
```

Perfect balance of simplicity and organization!
