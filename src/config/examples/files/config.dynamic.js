// Dynamic configuration using environment variables and logic
const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || (isDev ? 3000 : 8080);

export default {
  server: {
    port: parseInt(port),
    host: isDev ? 'localhost' : '0.0.0.0',
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost/dynamicapp',
  },
  debug: isDev,
  logging: {
    level: isDev ? 'debug' : 'warn',
  },
  features: {
    analytics: !isDev,
    hotReload: isDev,
    compression: !isDev,
  },
};
