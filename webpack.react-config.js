const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = {
  target: 'web',
  mode: 'development',

  entry: './src/react-web/index.tsx',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'public/react-web.bundle.js',
  },

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer')
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

  plugins: [new HtmlWebpackPlugin({
    title: 'Ocean',
    template: 'src/react-web/public/index.html',
    filename: 'public/index.html'
  })],
}