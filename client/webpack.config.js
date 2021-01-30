const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'client.bundle.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ 'solid' ]
          }
        }
      }
    ]
  },
  mode: 'development'
};