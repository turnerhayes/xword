const rfr                       = require("rfr");
rfr("utils/read-env");

const path                      = require("path");
const webpack                   = require("webpack");
const ExtractTextPlugin         = require("extract-text-webpack-plugin");
const HTMLWebpackPlugin         = require("html-webpack-plugin");
const HTMLWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const Config                    = rfr("server/lib/config");

const jsxFilenameRegex = /\.jsx?$/;

const stylesDirectory = path.join(Config.paths.client, "styles");
const scriptsDirectory = path.join(Config.paths.client, "scripts");

console.log("staticContentURL: ", Config.staticContent.url);

exports = module.exports = {
	entry: ["./client/scripts/polyfills", "./client/scripts/index.jsx"],

	output: {
		path: Config.paths.dist,
		publicPath: "/static/",
		filename: "js/[name]-[hash].js"
	},

	module: {
		rules: [
			{
				test: jsxFilenameRegex,
				include: scriptsDirectory,
				use: ["babel-loader", "eslint-loader"]
			},

			{
				test: /\.(less)|(css)$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: true,
								importLoaders: 2
							}
						},
						{
							loader: "postcss-loader",
							options: {
								sourceMap: true,
							}
						},
						{
							loader: "less-loader",
							options: {
								sourceMap: true,
							}
						},
					],
					publicPath: "/static/css"
				})
			},

			{
				test: /\.woff(2)?(\?.*)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "application/font-woff"
					}
				}
			},

			{
				test: /\.ttf(\?.*)?$/,
				use: "file-loader"
			},

			{
				test: /\.eot(\?.*)?$/,
				use: "file-loader"
			},

			{
				test: /\.wav(\?.*)?$/,
				use: "file-loader"
			},

			{
				test: /\.svg(\?.*)?$/,
				use: "file-loader"
			}
		]
	},

	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			minChunks: function (module) {
				// Include things under node_modules
				return module.context && module.context.indexOf("node_modules") >= 0;
			}
		}),

		new webpack.optimize.CommonsChunkPlugin({
			name: "webpackManifest"
		}),

		new webpack.ProvidePlugin({
			React: "react"
		}),

		new webpack.ProvidePlugin({
			// Required by EJS template engine used by HTMLWebpackPlugin
			_: "lodash",
		}),

		new webpack.EnvironmentPlugin({
			// Necessary environment variables for shared-lib/config
			NODE_ENV: Config.app.environment,
			WEB_SOCKETS_URL: null,
			STATIC_CONTENT_URL: null,
			STATIC_CONTENT_PORT: null,
			IS_DEVELOPMENT: Config.app.isDevelopment || false,
			CREDENTIALS_FACEBOOK_IS_ENABLED: Config.auth.facebook.isEnabled || false,
			CREDENTIALS_GOOGLE_IS_ENABLED: Config.auth.google.isEnabled || false,
			CREDENTIALS_TWITTER_IS_ENABLED: Config.auth.twitter.isEnabled || false,
		}),

		new ExtractTextPlugin({
			filename: "css/[name]-[hash].css",
			allChunks: true
		}),

		new HTMLWebpackPlugin({
			filename: path.join(Config.paths.root, "server", "views", "index.hbs"),
			template: path.join(Config.paths.root, "server", "views", "index.template.ejs"),
			alwaysWriteToDisk: true,
			inject: false,
			title: "Xword",
			minify: Config.app.isDevelopment ? false : {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
			},
			staticContentURL: Config.staticContent.url
		}),

		new HTMLWebpackHarddiskPlugin(),
	],

	resolve: {
		extensions: [".js", ".jsx", ".json", ".less", ".css"],
		// modules: [
		// 	"node_modules",
		// 	Config.paths.client,
		// 	path.join(Config.paths.client, "styles")
		// ],
		alias: {
			"project/shared-lib": path.join(__dirname, "shared-lib"),
			"project/scripts": scriptsDirectory,
			"project/styles": stylesDirectory,
			immutable: require.resolve("immutable"),
		}
	},

	node: {
		Buffer: true,
		fs: "empty",
		assert: true,
		events: true,
		process: true
	}
};
