import react from '@jperezmart/eslint-config/react';

export default [
  ...react,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.js'],
  },
];
