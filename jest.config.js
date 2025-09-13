module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/tests'],
  
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ['/node_modules/'],
  
  // An array of regexp pattern strings that are matched against all source file paths
  transformIgnorePatterns: ['/node_modules/'],
  
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Setup files that will be executed before each test file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
};