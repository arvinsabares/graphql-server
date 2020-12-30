module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/src/$1",
    "@modules/(.*)": "<rootDir>/src/modules/$1",
    "@models/(.*)": "<rootDir>/src/models/$1",
    "@helpers/(.*)": "<rootDir>/src/helpers/$1",
    "@routes/(.*)": "<rootDir>/src/routes/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-preload.js"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{js,ts}"
  ]
};