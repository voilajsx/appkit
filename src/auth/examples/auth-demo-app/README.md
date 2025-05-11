# Auth Demo App

A simple, visual demonstration of @voilajs/appkit authentication features using
vanilla JavaScript.

## Features

- User registration
- User login
- JWT token generation
- Protected API routes
- Visual token display
- No frontend frameworks - just vanilla JS!

## Setup

1. Install dependencies:

```bash
npm install express cors github:@voilajs/appkit
```

2. Run the server:

```bash
node server.js
```

3. Open http://localhost:3000 in your browser

## What You Can Test

1. **Register a new user** - Creates account with hashed password
2. **Login** - Generates JWT token
3. **View token** - See the actual JWT token
4. **Test protected route** - Call API with authentication
5. **Logout** - Clear session

## Files

- `index.html` - Simple UI
- `app.js` - Frontend JavaScript
- `server.js` - Express backend using @voilajs/appkit/auth

## Security Note

This is a demo app. In production:

- Use environment variables for secrets
- Implement proper token storage
- Add input validation
- Use HTTPS

## Learn More

- [@voilajs/appkit Documentation](https://github.com/voilajs/appkit)
- [Auth Module Guide](https://github.com/voilajs/appkit/tree/main/src/auth)
