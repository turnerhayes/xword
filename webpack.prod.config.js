const common                 = require("./webpack.common.config.js");
const webpack                = require("webpack");
const webpackMerge           = require("webpack-merge");
const WebpackChunkHashPlugin = require("webpack-chunk-hash");

exports = module.exports = webpackMerge.smart(common, {
	output: {
		filename: "js/[name]-[chunkhash].js"
	},

	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		
		new webpack.optimize.UglifyJsPlugin({
			beautify: false,
			mangle: {
				screw_ie8: true,
				keep_fnames: true
			},
			compress: {
				screw_ie8: true
			},
			comments: false
		}),

		new webpack.HashedModuleIdsPlugin(),

		new WebpackChunkHashPlugin(),
	]
});
