const baseConfig = require("../../jest.config.js");

module.exports = {
  ...baseConfig,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.server.json" }],
  },
};
