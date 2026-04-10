/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@olaac/eslint-config'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    // TypeScript ya valida props; prop-types es redundante en proyectos TS
    'react/prop-types': 'off',
  },
}
