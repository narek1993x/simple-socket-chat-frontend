const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const env = process.env.NODE_ENV;

const isDev = env === "development";

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
  entry: ["babel-polyfill", path.join(__dirname, "./index.js")],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "js/[name].min.js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".scss", "css"],
    alias: {
      components: path.join(__dirname, "components"),
      shared: path.join(__dirname, "components/shared"),
      socket: path.join(__dirname, "socket"),
      store: path.join(__dirname, "store"),
      helpers: path.join(__dirname, "helpers"),
    },
  },
  devtool: isDev ? "source-map" : false,
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [isDev ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.join(__dirname, "public/index.html"),
      filename: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].css",
      ignoreOrder: true,
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 3,
    }),
  ],
};
