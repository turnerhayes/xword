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
		// eslint-disable-next-line no-console
		console.error("Error reading SSL key file: ", ex);
	}
}

let sslCert;

if (Config.app.ssl.cert) {
	try {
		sslCert = fs.readFileSync(Config.app.ssl.cert);
	}
	catch (ex) {
		// eslint-disable-next-line no-console
		console.error("Error reading SSL cert file: ", ex);
	}
}

const devServer = {
	hot: true,
	port: 8200,
	headers: {
		"Access-Control-Allow-Origin": "*"
	},
	before(app) {
		app.use(
			"/static/fonts/font-awesome",
			cors({
				origin: Config.app.address.origin
			}),
			express.static(
				// Need to do this ugly resolve; using requre.resolve() doesn't seem to work,
				// possibly because the font-awesome package contains no main entry or index.js,
				// so Node treats it as not a package.
				path.resolve(__dirname, "node_modules", "font-awesome", "fonts"),
				{
					fallthrough: false
				}
			)
		);
	},
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
	],

	devtool: "source-map",
	// Note: currently, having webpack watch with devtool set to "source-map"
	// causes extreme memory leaks over several compilations (possibly due to
	// ExtractTextWebpackPlugin--see https://github.com/webpack/webpack/issues/2157).
	// Supposedly, this is not a problem when using cheap-eval-source-map
	// devtool: "cheap-eval-source-map",

	devServer
});
