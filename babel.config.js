const definePlugin = require('babel-plugin-transform-define');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'transform-define',
        {
          'process.env.EXPO_OS': 'ios',
        },
      ],
    ],
  };
};
