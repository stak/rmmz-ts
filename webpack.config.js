const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  target: 'web',
  node: {
    fs: 'empty'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'project/js'),
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [
      '.ts', '.js',
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/main.js", to: path.resolve(__dirname, "project/js") },
        { from: "src/plugins.js", to: path.resolve(__dirname, "project/js") },
        { from: "src/libs", to: path.resolve(__dirname, "project/js/libs") },
        { from: "src/plugins", to: path.resolve(__dirname, "project/js/plugins") }
      ]
    }),
    new WriteFilePlugin(),

    new CircularDependencyPlugin({
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        if (paths.some(path => path.includes('node_modules'))) {
          // ignore node_modules
          return;
        }
        if (paths.every((path, i) => {
          const nextPath = paths[i + 1];
          if (!nextPath) return true;
          if (path.split('/').pop() === "index.ts") {
            return nextPath.slice(0, nextPath.lastIndexOf('/')) === path.slice(0, path.lastIndexOf('/'));
          } else {
            return nextPath.split('/').pop() === "index.ts";
          }
        })) {
          // ignore internal import pattern
          return;
        }
        compilation.warnings.push(new Error(paths.join(' -> ')))
      },
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    })
  ],

  devServer: {
    contentBase: path.resolve(__dirname, 'project'),
    watchContentBase: true,
    port: 3000,
  }
};