module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': [0, 190, 4],
    'linebreak-style': [0, 'windows'],
    'no-underscore-dangle': 'off',
    'one-var-declaration-per-line': 'off',
    'one-var': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': ['error', { "props": false }],
    'no-else-return': 'off',
    'object-curly-newline': 'off',
    "import/no-named-as-default": 0,
    "prefer-destructuring": ["error", {"object": true, "array": false}]
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
