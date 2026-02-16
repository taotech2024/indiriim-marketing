const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const fs = require('fs');
const envPathMode = path.resolve(__dirname, `.env.${NODE_ENV}`);
const envPathExample = path.resolve(__dirname, '.env.example');
const envPath = fs.existsSync(envPathMode) ? envPathMode : envPathExample;
require('dotenv').config({ path: envPath });
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const publicPath = process.env.PUBLIC_PATH || '/';

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp|woff2?|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash][ext]'
        }
      }
    ]
  },
  plugins: [
    new Dotenv({
      dotenv: { path: envPath }
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
      'process.env.PUBLIC_PATH': JSON.stringify(publicPath)
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      cache: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 5174,
    hot: true
  }
};

