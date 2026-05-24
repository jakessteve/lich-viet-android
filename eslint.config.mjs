import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'packages/**/dist/**',
      'docs/**',
      'public/**',
      '*.config.*',
      'scripts/**',
      'src/packages/**', // vendored bundles (iztro, circular-natal-horoscope, vn-lunar)
    ],
  },

  // Base recommended rules
  eslint.configs.recommended,

  // TypeScript rules (type-aware disabled for speed)
  ...tseslint.configs.recommended,

  // React Hooks
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // React best practices
  {
    files: ['src/**/*.{tsx,jsx}'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/jsx-no-target-blank': 'error',
      'react/jsx-key': 'error',
      'react/no-deprecated': 'warn',
      // Unescaped entities (' " > etc.) are cosmetic — not a real bug
      'react/no-unescaped-entities': 'off',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      // React 19: JSX runtime handles imports automatically
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },

  // Accessibility (WCAG 2.1 AA)
  {
    files: ['src/**/*.{tsx,jsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      // Labels: deeply nested pattern in this codebase; functional a11y verified
      'jsx-a11y/label-has-associated-control': 'off',
      // Click handlers on non-interactive elements (progressive enhancement)
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      // autoFocus is intentional on date pickers and search forms
      'jsx-a11y/no-autofocus': 'off',
      // Allow interactive roles on non-interactive elements (cards, panels)
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    },
  },

  // Unused imports auto-removal
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // Project-specific adjustments
  {
    rules: {
      // Strict type safety — use specific types, not `any`
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      'prefer-const': 'error',
    },
  },
);
