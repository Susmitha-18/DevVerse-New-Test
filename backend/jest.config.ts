import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest to transform TypeScript files on the fly during testing
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Where to find test files
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Collect coverage from src/
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts', // Entry point — integration tested separately
  ],

  // Coverage thresholds — enforce quality
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Clear mocks between each test
  clearMocks: true,
  resetMocks: true,

  // Verbose output
  verbose: true,
};

export default config;
