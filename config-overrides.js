import { Buffer } from "buffer/"; 
 window.Buffer = Buffer;

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config, env) {
  config.plugins = [
    ...config.plugins,
    new NodePolyfillPlugin()
  ];

  config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json'];

  return config;
};