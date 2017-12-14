const common            = require("./webpack.common.config.js");
const path              = require("path");
const fs                = require("fs");
const webpack           = require("webpack");
const webpackMerge      = require("webpack-merge");
const express           = require("express");
const cors              = require("cors");
const Config            = require("./server/lib/config");

let sslKey;

if (Config.app.ssl.key) {
	try {
		sslKey = fs.readFileSync(Config.app.ssl.key);
	}
	catch (ex) {
		const err = new Error("Error reading SSL key file: " + ex.message);
		err.exception = ex;
		throw err;
	}
}

let sslCert;

if (Config.app.ssl.cert) {
	try {
		sslCert = fs.readFileSync(Config.app.ssl.cert);
	}
	catch (ex) {
		const err = new Error("Error reading SSL cert file: " + ex.message);
		err.exception = ex;
		throw err;
	}
}

const devServer = {
	headers: {
		"Access-Control-Allow-Origin": "*"
	},
	hot: true,
	compress: true,
	quiet: true,
	publicPath: common.output.publicPath,
};

if (sslKey && sslCert) {
	devServer.https = {
		key: sslKey,
		cert: sslCert,
	};
}

exports = module.exports = webpackMerge.smart(common, {
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],

	devtool: "source-map",
	// Note: currently, having webpack watch with devtool set to "source-map"
	// causes extreme memory leaks over several compilations (possibly due to
	// ExtractTextWebpackPlugin--see https://github.com/webpack/webpack/issues/2157).
	// Supposedly, this is not a problem when using cheap-eval-source-map
	// devtool: "cheap-eval-source-map",

	devServer
});
