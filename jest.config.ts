import type { JestConfigWithTsJest } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  verbose: true,
  collectCoverageFrom: ['src/**/*.{js, jsx, ts,tsx}'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    // only files in **/__tests__/ with .test. in file name
    '**/__tests__/*.test.[jt]s?(x)',
  ],
};

export default jestConfig;
