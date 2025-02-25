module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {},
    "ecmaVersion": 2023,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "linebreak-style": ["error", "unix"],
    "semi": ["error", "always"]
  }
};
