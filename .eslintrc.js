export default {
    env: {
      node: true,
      es2022: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed']
    }
  };