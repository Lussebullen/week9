import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], 
    plugins: { js }, 
    extends: ['js/recommended'], 
    languageOptions: { globals: globals.node } 
  },
  tseslint.configs.recommended,
  {
    ignores: ['node_modules', 'dist'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      curly: ['error', 'all'], // Enforce consistent use of curly braces
      semi: ['error', 'always'], // Enforce semicolons at the end of statements
      quotes: ['error', 'single'], // Enforce single quotes for strings
      indent: ['error', 2], // Enforce 2-space indentation
      'object-curly-spacing': ['error', 'always'], // Enforce spaci  ng inside curly braces
      'no-console': 'off', // Warn on console.log statements. Please remove them in production code, but for now I want to see that the server is running.
    }
  }
]);
