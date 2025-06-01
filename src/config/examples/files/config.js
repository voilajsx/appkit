// Basic JavaScript configuration
export default {
  server: {
    port: 4000,
    host: 'localhost',
  },
  database: {
    url: 'mongodb://localhost/jsapp',
  },
  environment: 'development',
  features: {
    analytics: true,
    cache: false,
  },
};
