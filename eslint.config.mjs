import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default eslint.defineConfig({
  ignores: ['eslint.config.mjs'],
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dir,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    globals: {
      ...globals.node,
      ...globals.jest,
    },
  },
  plugins: {
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    prettier: require('eslint-plugin-prettier'),
  },
  rules: {
    'prettier/prettier': 'error',
    // tắt bớt rules nếu muốn
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // ... các rules khác bạn muốn bật hoặc tắt
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
});

// import eslint from '@eslint/js';
// import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// import globals from 'globals';
// import tseslint from 'typescript-eslint';

// export default tseslint.config(
//   {
//     ignores: ['eslint.config.mjs'],
//   },
//   eslint.configs.recommended,
//   ...tseslint.configs.recommendedTypeChecked,
//   eslintPluginPrettierRecommended,
//   {
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//       parserOptions: {
//         projectService: true,
//         tsconfigRootDir: import.meta.dirname,
//       },
//     },
//   },
//   {
//     rules: {
//       'prettier/prettier': 'error',

//       '@typescript-eslint/interface-name-prefix': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/ban-types': 'off',
//       '@typescript-eslint/no-unused-vars': 'off',
//       '@typescript-eslint/no-floating-promises': 'off',
//       '@typescript-eslint/no-unsafe-assignment': 'off',
//       '@typescript-eslint/no-unsafe-call': 'off',
//       '@typescript-eslint/no-unsafe-member-access': 'off',
//       '@typescript-eslint/no-unsafe-return': 'off',
//       '@typescript-eslint/no-unsafe-argument': 'off',
//       '@typescript-eslint/no-empty-object-type': 'off',
//       '@typescript-eslint/no-unsafe-function-type': 'off',

//       // TS errors
//       '@typescript-eslint/no-misused-new': 'error',
//       '@typescript-eslint/explicit-module-boundary-types': 'error',
//       '@typescript-eslint/no-non-null-assertion': 'error',

//       // Eslint off
//       'import/extensions': 'off',
//       'import/prefer-default-export': 'off',
//       'class-methods-use-this': 'off',
//       'no-useless-constructor': 'off',
//       'import/no-unresolved': 'off',
//       'no-control-regex': 'off',
//       'no-shadow': 'off',
//       'import/no-cycle': 'off',
//       'consistent-return': 'off',
//       'no-underscore-dangle': 'off',
//       'max-classes-per-file': 'off',

//       // Eslint errors
//       'no-restricted-syntax': [
//         'error',
//         {
//           selector: 'LabeledStatement',
//           message:
//             'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
//         },
//         {
//           selector: 'WithStatement',
//           message:
//             '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
//         },
//         {
//           selector: "MethodDefinition[kind='set']",
//           message: 'Property setters are not allowed',
//         },
//       ],
//     },
//   },
// );
