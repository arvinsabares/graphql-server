module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/src/$1",
    "@modules/(.*)": "<rootDir>/src/modules/$1",
    "@models/(.*)": "<rootDir>/src/models/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-preload.js"],
};