const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',   // Modern JavaScript
              '@babel/preset-react' // React'
            ]
          }
        }
      },
      {
        test: /\.(png|jpe?g|webp|gif)$/i,
        type: 'asset/resource', // Handles image files
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolves .js and .jsx extensions]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Rotations',
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'template.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src', 'icon.png'), to: 'icon.png' }, // Copy icon.png
        { from: path.resolve(__dirname, 'src', 'appconfig.json'), to: 'appconfig.json' }, // Copy appconfig.json
      ],
    }),
  ]
}