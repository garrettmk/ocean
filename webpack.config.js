const path = require('path');

module.exports = {
  entry: './src/index.ts',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  mode: process.env.NODE_ENV || 'development',

  resolve: {
    extensions: ['.ts']
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
}