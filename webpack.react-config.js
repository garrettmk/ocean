const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = {
  target: 'web',
  mode: 'development',

  entry: './src/react-web/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: path.join('public', 'react-web.bundle.js'),
  },

  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist', 'public')
    },
    port: 3001,
    proxy: {
      '/graphql': 'http://localhost:3000'
    },
    hot: 'only',
    historyApiFallback: true 
  },

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
        test: /\.(ts|tsx)$/i,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [new HtmlWebpackPlugin({
    title: 'Ocean',
    template: 'src/react-web/public/index.html',
    filename: 'public/index.html'
  })],
}