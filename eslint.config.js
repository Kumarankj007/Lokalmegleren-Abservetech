import eslintPluginPrettier from 'eslint-plugin-prettier'

export default [
  {
    files: ['**/*.js'], // Apply ESLint to all JS files
    ignores: ['node_modules/', 'dist/'], // Ignore common folders
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'max-len': ['error', { code: 120 }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          tabWidth: 2,
          printWidth: 120,
          singleQuote: true,
          trailingComma: 'es5',
          semi: false,
        },
      ],
    },
  },
]
