module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  env: {
    es2020: true,
    node: true,
  },
  ignorePatterns: ['out/**'],
  rules: {},
};
