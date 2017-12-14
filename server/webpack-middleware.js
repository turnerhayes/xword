const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const rfr = require("rfr");
const webpackConfig = rfr("webpack.dev.config.js");

const reactHMREntry = "react-hot-loader/patch";
const hotEntry = "webpack-hot-middleware/client";

if (!webpackConfig.entry) {
	throw new Error("No entry defined for webpack config");
}

if (Array.isArray(webpackConfig.entry)) {
	// Make sure polyfills is first
	const polyfillsIndex = webpackConfig.entry.lastIndexOf("./client/scripts/polyfills");

	if (polyfillsIndex < 0) {
		webpackConfig.entry.unshift(reactHMREntry, hotEntry);
	}
	else {
		webpackConfig.entry.splice(polyfillsIndex + 1, 0, reactHMREntry, hotEntry);
	}
}
else if (typeof webpackConfig.entry === "string") {
	webpackConfig.entry = [reactHMREntry, hotEntry, webpackConfig.entry];
}
else {
	throw new Error("Don't know how to handle webpack config entry");
}

const compiler = webpack(webpackConfig);

const devMiddleware = webpackDevMiddleware(compiler, {
	noInfo: true,
	publicPath: webpackConfig.output.publicPath,
});

const hotMiddleware = webpackHotMiddleware(compiler, {
	log: console.log,
	path: '/__webpack_hmr',
	heartbeat: 10 * 1000,
});

module.exports = function webpackMiddleware(app) {
	app.use(devMiddleware);

	app.use(hotMiddleware);
};
