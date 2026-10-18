const baseConfig = require("../../jest.config.js");

module.exports = {
  ...baseConfig,
  testMatch: ["<rootDir>/src/server/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.server.json" }],
  },
};
