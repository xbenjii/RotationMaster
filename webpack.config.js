const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: false,
    hot: true,
    compress: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      util: require.resolve('util/'),
    },
    fallback: {
      "electron/common": false, // Mock the module
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/, // Add this rule for SCSS files
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'asset/resource/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/asset'), // Source folder
          to: path.resolve(__dirname, 'dist/asset'), // Destination folder
        },
        {
          from: path.resolve(__dirname, 'src/appconfig.json'), // Source folder
          to: path.resolve(__dirname, 'dist/appconfig.json'), // Destination folder
        },
        {
          from: path.resolve(__dirname, 'src/icon.png'), // Source folder
          to: path.resolve(__dirname, 'dist/icon.png'), // Destination folder
        }
      ],
    }),
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^sharp$/,
    }),
  ],
};