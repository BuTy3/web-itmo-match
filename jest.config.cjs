module.exports = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.[jt]sx?$": "babel-jest" },
  moduleNameMapper: { "\\.(css|scss)$": "identity-obj-proxy" },

  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/tests-e2e/"],

  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/**/index.{js,jsx}"],
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: { lines: 80, statements: 80, functions: 80, branches: 80 }, // G3.5
  },
};
