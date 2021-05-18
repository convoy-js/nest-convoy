module.exports = {
  env: {
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
    createDefaultProgram: true,
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/internal-regex': '^@(nest-convoy)/',
  },
  rules: {
    'import/no-unresolved': 'off',
    'import/newline-after-import': 'error',
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '^@(nest-convoy)/',
            group: 'internal',
            position: 'before',
          },
        ],
      },
    ],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'private-static-field',
          'protected-static-field',
          'public-static-field',

          'private-static-method',
          'protected-static-method',
          'public-static-method',

          'private-abstract-field',
          'protected-abstract-field',
          'public-abstract-field',

          //          This will cause an error because static decorated fields are not supported
          //          "private-decorated-field",
          //          "protected-decorated-field",
          //          "public-decorated-field",

          'private-instance-field',
          'protected-instance-field',
          'public-instance-field',

          'private-constructor',
          'protected-constructor',
          'public-constructor',

          'private-abstract-method',
          'protected-abstract-method',
          'public-abstract-method',

          //          This will cause an error because static decorated methods are not supported
          //          "private-decorated-method",
          //          "protected-decorated-method",
          //          "public-decorated-method",

          'private-instance-method',
          'protected-instance-method',
          'public-instance-method',
        ],
      },
    ],
    //    "@typescript-eslint/explicit-module-boundary-types": "error",
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prettier/prettier': ['error', require('./.prettierrc.json')],
  },
};
