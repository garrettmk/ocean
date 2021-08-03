const path = require('path');


module.exports = {
  target: 'node',
  entry: './src/server/index.ts',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.bundle.js'
  },

  mode: 'development',

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    }
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
}