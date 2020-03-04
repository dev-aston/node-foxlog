// http://eslint.org/docs/user-guide/configuring
const standard = require('eslint-config-standard/eslintrc.json');
const rules = Object.assign({}, standard.rules, {
  // allow paren-less arrow functions
  'arrow-parens': 0,
  // allow async-await
  'generator-star-spacing': 0,

  'brace-style': ['error', 'stroustrup'],
  'no-multiple-empty-lines': 0,
  'eol-last': 0,
  'semi': ["error", "always"]
});

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  plugins: standard.plugins,
  // add your custom rules here
  'rules': rules
};
