"use strict";

const path              = require('path');
const webpack           = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports = module.exports = {
	entry: {
		app: [
			'babel-polyfill',
			'bootstrap-loader',
			path.resolve(__dirname, 'static', 'scripts', 'main')
		]
	},

	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[id].chunk.js',
		path: path.resolve(__dirname, 'static', 'dist'),
		publicPath: '/static/dist/'
	},

	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loader: 'jsx',
				exclude: /node_modules/
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel',
			},
			{
				test: /\.scss$/,
				include: ['./static/styles'],
				loaders: ["style", "css-loader?sourceMap", "sass-loader?sourceMap"]
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract('css-loader!sass-loader')
			},
			{
				test: /\.png$/,
				loader: "url-loader?limit=100000"
			},
			{
				test: /(\.jpg)|(\.html)$/,
				loader: "file-loader"
			},
			{
				test: /\.json$/,
				loader: "json-loader"
			},
			{
				test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url?limit=10000',
			},
			{
				test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
				loader: 'file',
			},
			{
				test: /bootstrap-sass\/assets\/javascripts\//,
				loader: 'imports?jQuery=jquery'
			},
		]
	},

	plugins: [
		// Webpack 1.0
		new webpack.optimize.OccurenceOrderPlugin(),
		// Webpack 2.0 fixed this mispelling
		// new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new ExtractTextPlugin('[name].bundle.css', {
            allChunks: true
        })
	],

	node: {
		fs: "empty"
	},

	devtool: 'source-map',

	resolve: {
		root: [
			path.resolve('static', 'node_modules'),
			path.resolve('static', 'sass'),
		],
		extensions: ['', '.jsx', '.js', '.scss', '.css']
	}
};
