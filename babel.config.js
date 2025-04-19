const definePlugin = require('babel-plugin-transform-define');

module.exports = function(api) {
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
        "@/src": "./src",
        "@/components": "./src/components",
        "@/screens": "./src/screens",
        "@/hooks": "./src/hooks",
        "@/utils": "./src/utils",
        "@/constants": "./src/constants",
        "@/navigation": "./src/navigation",
        "@/services": "./src/services",
        "@/types": "./src/types",
        "@/store": "./src/store",
        "@/assets": "./assets",
        "tailwind.config": "./tailwind.config.js"
      },
      extensions: [
        '.ios.js',
        '.android.js',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
      ],
    }]],
  };
};
