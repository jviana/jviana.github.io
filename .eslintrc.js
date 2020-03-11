/* module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
  }
} */

module.exports = {
  "extends": "standard",
  "rules": {
      "semi"  : ["error", "always"],
      "indent": ["error", 4],
  },
  "env": {
      "jquery": true,
      "browser": true
  },
};
