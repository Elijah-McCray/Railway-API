/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/client_*.js",
    "**/railway_*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/tests/**"
  ],
  coverageReporters: ["text", "lcov", "html"]
};
