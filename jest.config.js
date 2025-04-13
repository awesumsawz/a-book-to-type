// jest.config.js
const nextJest = require('next/jest')(); // Correctly invoke next/jest

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: For global setup
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (adjust based on your tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    // Handle CSS imports (optional, if you face issues)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports (optional)
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle pdfjs-dist worker (needed for InputArea tests)
    'pdfjs-dist/build/pdf.worker.min.mjs': '<rootDir>/__mocks__/fileMock.js', 
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/', // Default
    '^.+\\.module\\.(css|sass|scss)$', // Default for CSS modules
    // Add any other libraries that might need transpiling if they cause issues
    // For example, if pdfjs-dist or tesseract.js cause syntax errors:
    // '/node_modules/(?!(pdfjs-dist|tesseract.js)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = nextJest(config); 