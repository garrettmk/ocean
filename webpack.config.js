const path = require('path');

module.exports = {
  entry: './src/server/index.ts',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.bundle.js'
  },

  mode: 'development',

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.ts'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      }
    ]
  }
}