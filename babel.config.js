module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@app': './src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      ["module:react-native-dotenv", {
        envName: "APP_ENV",
        moduleName: "@env",
        path: ".env",
        safe: true,
        allowUndefined: false,
        verbose: false
      }]
    ],
  };
}; 