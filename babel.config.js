const definePlugin = require('babel-plugin-transform-define');

module.exports = function(api) {
  api.cache(true);
  api.cache(true);
  return {
    presets: [["babel-preset-expo", {
      jsxImportSource: "nativewind"
    }], "nativewind/babel"],
    plugins: [[
      'transform-define',
      {
        "process.env.EXPO_OS": "ios",
      },
    ], ["module-resolver", {
      root: ["./"],

      alias: {
        "@": "./",
        "tailwind.config": "./tailwind.config.js"
      }
    }]],
  };
};
