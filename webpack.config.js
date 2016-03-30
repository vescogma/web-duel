var path = require('path');
var webpack = require('webpack');
var postcssImport = require('postcss-import');
var postcssNext = require('postcss-cssnext');
var autoprefixer =  require('autoprefixer');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: 'dist',
    filename: 'bundle.js',
    publicPath: '/',
    sourceMapFilename: 'bundle.map',
  },
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader',
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=react,presets[]=stage-0,plugins[]=transform-decorators-legacy'],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader?prefix=img/&limit=5000',
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        loader: 'url-loader?prefix=font/&limit=5000',
      },
    ],
    postLoaders: [
      {
        include: path.resolve(__dirname, 'node_modules/pixi.js'),
        loader: 'transform?brfs'
      }
    ]
  },
  postcss: function (webpack) {
    return [
      postcssImport({
        addDependencyTo: webpack,
      }),
      postcssNext({
        browsers: ['ie >= 8', 'last 2 versions'],
      }),
      autoprefixer,
    ];
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}