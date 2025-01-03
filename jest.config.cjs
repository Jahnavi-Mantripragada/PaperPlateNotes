module.exports = {
    setupFiles: ["./jest-setup.js"],
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use Babel for transforming files
    },
    transformIgnorePatterns: [
      "node_modules/(?!(node-fetch)/)", // Allow node-fetch to be transformed
    ],
  };
  