module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: { '\\.(css|scss)$': 'identity-obj-proxy' },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/index.{js,jsx}'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { lines: 80, statements: 80, functions: 80, branches: 80 }
  },
};
