const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
  mode: 'development',
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
    library: { type: "umd", name: "RotationMaster" }
  },
  // prevent webpack from bundling these imports (alt1 libs can use them when running in nodejs)
  externals: [
    "sharp",
    "canvas",
    "electron/common"
  ],
  resolve: {
    extensions: [".wasm", ".tsx", ".ts", ".mjs", ".jsx", ".js"]
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
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Modern JavaScript
              '@babel/preset-react', // React
            ],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: "asset/resource",
        generator: { filename: "[base]" }
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      // Exclude .html files from asset/resource
      {
        test: /\.(json)$/,
        type: "asset/resource",
        generator: { filename: "[base]" }
      },
      // file types useful for writing alt1 apps, make sure these two loader come after any other json or png loaders, otherwise they will be ignored
      {
        test: /\.data\.png$/,
        loader: "alt1/imagedata-loader",
        type: "javascript/auto"
      },
      {
        test: /\.fontmeta.json/,
        loader: "alt1/font-loader"
      }
    ],
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
  ],
};