const baseConfig = require("../../jest.config.js");

module.exports = {
  ...baseConfig,
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.utils.json" }],
  },
};
