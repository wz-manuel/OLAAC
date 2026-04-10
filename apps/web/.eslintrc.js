/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@olaac/eslint-config/next'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
}
