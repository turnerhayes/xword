#!/usr/bin/env node

const path = require("path");
const rfr = require("rfr");
const debugModule = require("debug");
rfr("utils/read-env");
const configPath = path.resolve(__dirname, "..", "server", "lib", "config.js");
let Config = require(configPath);
const startScriptPath = path.resolve(__dirname, "..", "server", "bin", "www.js");

const appPort = Config.app.address.externalPort;
let debug;
let devServerDebug;

function formatMessage(message) {
	let lines = message.split("\n").filter(
		(line) => !/\s+@/.test(line)
	);

	const filePath = lines[0];
	const absolutePath = path.resolve(Config.paths.root, filePath);

	lines = lines.filter(
		(line) => line.indexOf(absolutePath) < 0
	);

	return lines.join("\n");
}

function startDevServer() {
	const webpack = require("webpack");
	const WebpackDevServer = require("webpack-dev-server");
	const chalk = require("chalk");
	const webpackConfig = rfr("webpack.dev.config");

	try {
		devServerDebug("Starting dev server");

		webpackConfig.stats = {
			colors: false,
		};

		const compiler = webpack(webpackConfig);

		compiler.plugin("invalid", (file) => {
			console.info("Recompiling due to file change:");
			console.info("\t" + path.relative(Config.paths.root, file));
		});

		compiler.plugin("done", (stats) => {
			if (stats.hasErrors() || stats.hasWarnings()) {
				const messages = stats.toJson({
					colors: false,
					source: false,
					errors: true,
					warnings: true,
					chunks: false,
					assets: false,
					modules: false,
					children: false,
					publicPath: false,
					entrypoints: false,
					hash: false,
					version: false,
					context: Config.paths.root,
				});

				if (messages.errors && messages.errors.length > 0) {
					console.error(chalk.red("Failed to compile:"));
					console.error(messages.errors.map(formatMessage).join("\n\n"));
					return;
				}

				console.warn(chalk.yellow("Compiled with warnings:"));
				console.warn(messages.warnings.map(formatMessage).join("\n\n"));
			}
			else {
				console.info(chalk.green("Compiled successfully"));
			}
		});

		compiler.plugin("failed", (err) => {
			console.error(chalk.red("Failed to start dev server:"));
			console.error(chalk.red(err.stack || err));
			if (err.details) {
				console.error(chalk.red(err.details));
			}
		});

		const devServerConfig = webpackConfig.devServer || {};

		devServerConfig.port = appPort;
		devServerConfig.proxy = [
			{
				context: ["**", "!" + webpackConfig.output.publicPath + "**"],
				target: Config.app.address.internalAddress,
				secure: false,
			},
		];

		console.log("devServerConfig:", JSON.stringify(devServerConfig, (key, value) => {
			if (key === "cert" || key === "key") {
				return "<Buffer>";
			}

			return value;
		}, "  "));

		const devServer = new WebpackDevServer(compiler, devServerConfig);

		devServer.listen(appPort, () => {
			if (err) {
				throw err;
			}

			devServerDebug("Dev server started on port %d", appPort);
		});

		[
			"SIGINT",
			"SIGHUP",
		].forEach(
			(signal) => {
				process.once(signal, () => {
					devServerDebug("Closing dev server due to signal %s", signal);
					devServer.close();
				});
			}
		);

		process.once("unhandledException", () => {
			devServerDebug("Closing dev server due to unhandled exception");
			devServer.close();
		});
	}
	catch(err) {
		devServerDebug(chalk.red("Error compiling webpack config"));
		throw err;
	}
}

function reAssignPorts() {
	const portfinder = require("portfinder");
	
	// Make sure not to assign to the app port because the dev server will be listening on there
	portfinder.basePort = appPort + 1;

	return portfinder.getPortPromise().then(
		(port) => {
			// We're using the external app port on the same host for static content
			delete process.env.STATIC_CONTENT_URL;
			process.env.PORT = port;
			process.env.APP_ADDRESS_EXTERNAL_PORT = appPort;

			// Make sure the config re-initializes with the new port numbers when required
			// again
			delete require.cache[path.resolve(__dirname, "..", "shared-lib", "config.js")];
			delete require.cache[configPath];
			Config = require(configPath);
		}
	)
}

function startAPIServer() {
	const nodemon = require("nodemon");

	nodemon({
		script: startScriptPath,
	});

	nodemon.on("quit", () => {
		debug("API server has quit");
		process.exit();
	}).on("restart", (files) => {
		debug("API server has restarted due to changes in the following files:\n\t" +
			files.map((file) => path.relative(Config.paths.root, file)).join("\n\t")
		);
	});
}

if (Config.app.isDevelopment) {
	debugModule.enable("xword:*" + (
		process.env.DEBUG ?
			"," + process.env.DEBUG :
			""
	));

	// debug.enable() disables any debuggers created before it (see
	// https://github.com/visionmedia/debug/issues/533) so we have to create these after
	// calling `enable()`.
	debug = debugModule("xword:scripts:start");
	devServerDebug = debugModule("xword:dev-server");

	reAssignPorts().then(
		() => {
			startDevServer();

			startAPIServer();
		}
	);

}
else {
	require(startScriptPath);
}
