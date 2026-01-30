/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@sedona/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
