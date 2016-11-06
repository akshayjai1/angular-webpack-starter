const env = require('dotenv').config({ silent: true });
const webpack = require('webpack');
const path = require('path');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const helpers = require('./helpers');
const constants = require('./constants');

const isProd = process.env.npm_lifecycle_event === 'build';
const envMap = _.mapValues(env, v => JSON.stringify(v));

const entry = {
  'polyfills': './src/polyfills.ts',
  'vendor-style': './src/vendor-style.ts',
  'app': './src/main.ts'
};

if (isProd) {
  entry.vendor = './src/vendor.ts'
}

module.exports = {
  entry: entry,

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /^((?!(ngfactory|shim)).)*ts$/,
        loader: 'tslint'
      },
      {
        test: /\.ts$/,
        loaders: [
          'angular2-router-loader?loader=system&genDir=src/app/compiled/src/app&aot=' + isProd
        ]
      },
      {
        test: /\.html$/,
        loader: 'html',
        exclude: helpers.root('src', 'public')
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        loader: ExtractTextPlugin
          .extract({
              fallbackLoader: "style-loader",
              loader: ['css' + (isProd ? '?minimize' : ''), 'postcss']
          })
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
        loader: 'raw!postcss'
      }
    ]
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        jquery: 'jquery'
    }),

    new webpack.DefinePlugin({
      'process.env': envMap
    }),

    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      constants.CONTEXT_REPLACE_REGEX,
      helpers.root('./src') // location of your src
    ),

    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'vendor-style', 'polyfills']
    }),

    new HtmlWebpackPlugin({
      favicon: 'src/favicon.ico',
      template: 'src/public/index.html'
    }),

    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [require('postcss-cssnext')],
        tslint: {
          emitError: false,
          failOnHint: false
        }
      }
    })
  ]

};