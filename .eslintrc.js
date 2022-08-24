module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    indent: 'off', // handled with prettier
    quotes: 'off', // handled with prettier
    'no-undef': 'error',
    'prefer-const': 'error',
    semi: ['error', 'always'],
    'no-console': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  // To match js-monorepo config
  overrides: [
    {
      files: ['./**/*'],

      extends: ['plugin:react/recommended'],
      plugins: ['react', 'react-hooks'],

      settings: {
        react: {
          version: '17.0.2',
        },
      },

      env: {
        browser: true,
      },

      globals: {
        React: true,
        JSX: true,
      },

      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        // react
        'react/prop-types': 'off',
        'react/jsx-key': 'off',

        // react-hooks
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },
    {
      files: ['tests/e2e/**/*'],
      env: {
        mocha: true,
      },
      globals: {
        cy: true,
      },
    },
    {
      files: ['**/*.stories.@(js|jsx|ts|tsx)'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};
