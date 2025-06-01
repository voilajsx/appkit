// Advanced configuration with computed values
const environments = {
  development: 'dev',
  staging: 'stage',
  production: 'prod',
};

const env = environments[process.env.NODE_ENV] || 'dev';

export default {
  database: {
    url: `mongodb://${env}-server/advancedapp`,
  },
  api: {
    endpoints: {
      users: `/api/${env}/users`,
      auth: `/api/${env}/auth`,
      data: `/api/${env}/data`,
    },
  },
  cache: {
    ttl: env === 'prod' ? 3600 : 60,
    enabled: env !== 'dev',
  },
};
