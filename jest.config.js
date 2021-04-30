/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
/**
 * @type {import('@jest/types').Config.GlobalConfig}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/__tests__/**/*',
    '!packages/**/src/index.ts',
    '!**/*.d.ts',
  ],
  moduleNameMapper: {
    '@nutlet/([^/]+)(.*)$': '<rootDir>/packages/$1/src$2',
  },
  testPathIgnorePatterns: ['/node_modules/', '/examples/', '\\.js$', '\\.d\\.ts$', '\\.fixture.*$'],
}
