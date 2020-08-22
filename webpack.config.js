const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  target: 'web',
  node: {
    fs: 'empty'
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'static/js'),
  }
};