const path = require('path');


module.exports = {
  target: 'node',
  mode: 'development',

  entry: './src/server/index.ts',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.bundle.js'
  },

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
        exclude: /node_modules|test/,
        use: 'ts-loader'
      },
      {
        test: /\.node$/,
        loader: "node-loader"
      }
    ]
  },

  experiments: {
    topLevelAwait: true
  },
}