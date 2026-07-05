// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', '.netlify/**'],
  },
  {
    // Service worker — runs in a worker scope with Firebase compat
    // scripts pulled in via importScripts, not the app's module graph.
    files: ['public/firebase-messaging-sw.js'],
    languageOptions: {
      globals: {
        importScripts: 'readonly',
        firebase: 'readonly',
        self: 'readonly',
        console: 'readonly',
      },
    },
  },
);
