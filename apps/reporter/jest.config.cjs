const baseConfig = require("../../jest.config.js");

module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: "server",
      testMatch: ["<rootDir>/src/server/**/*.spec.ts"],
      transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.server.json" }],
      },
    },
    {
      ...baseConfig,
      displayName: "client",
      testMatch: ["<rootDir>/src/client/**/*.spec.ts"],
      transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.utils.json" }],
      },
    },
  ],
};
