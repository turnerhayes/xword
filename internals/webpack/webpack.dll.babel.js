/**
 * WEBPACK DLL GENERATOR
 *
 * This profile is used to cache webpack's module
 * contexts for external library and framework type
 * dependencies which will usually not change often enough
 * to warrant building them from scratch every time we use
 * the webpack process.
 */
const rfr = require("rfr");
const pkg = rfr("package.json");

const dllPlugin = rfr("internals/config").dllPlugin;

const path = require("path");
const defaults = require("lodash/defaultsDeep");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const baseWebpackConfig = require("./webpack.base.babel");
const Config = rfr("server/lib/config");

const dllConfig = defaults(require("./dll-config"), dllPlugin.defaults);
const outputPath = path.join(Config.paths.root, dllConfig.path);

module.exports = baseWebpackConfig({
	context: Config.paths.root,
	entry: dllConfig.dlls ? dllConfig.dlls : dllPlugin.entry(Object.keys(pkg.dependencies), dllConfig),
	devtool: "eval",
	output: {
		filename: "[name].dll.js",
		path: outputPath,
		library: "[name]",
	},
	plugins: [
		new webpack.DllPlugin({
			name: "[name]",
			path: path.join(outputPath, "[name].json"),
		}),

		new BundleAnalyzerPlugin({
			analyzerMode: "static",
			openAnalyzer: false,
			reportFilename: "stats.html",
			generateStatsFile: true,
		}),
	],
	performance: {
		hints: false,
	},
});
