/* eslint-env node */

module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    'prefer-const': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
    '@next/next/no-img-element': 'warn',
  },

  overrides: [
    {
      files: ['app/api/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],

  ignorePatterns: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
};
