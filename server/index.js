/* eslint consistent-return:0 */

"use strict";

require("dotenv").config();

const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const HTTPStatusCodes = require("http-status-codes");
const chalk = require("chalk");
const ip = require("ip");
const Loggers = require("./lib/loggers");
const setup = require("./middlewares/frontendMiddleware");
const passportMiddleware = require("./middlewares/passport");
const Config = require("./lib/config");
const ngrok = Config.app.isDevelopment && process.env.ENABLE_TUNNEL ? require("ngrok") : false;
const { router, raise404 } = require("./routes");


// Make sure to initalize DB connection
require("./persistence/db-connection");

const app = express();

const server = http.createServer(app);

app.use(Loggers.http);

app.use(cookieParser(Config.session.secret));

app.use(require("./lib/session"));

passportMiddleware(app);

app.use(router);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
	outputPath: Config.paths.dist,
	publicPath: "/static/",
});

/// catch 404 and forwarding to error handler
app.use(raise404);

/// error handlers

// Express uses the arity of the handler function to determine whether this is
// an error handler, so it needs to take 4 arguments
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
	res.status(err.status || HTTPStatusCodes.INTERNAL_SERVER_ERROR);

	const errData = {
		message: err.message,
		error: Config.app.isDevelopment ?
			{
				message: err.message,
				stack: err.stack
			} :
			{}
	};

	if (err.status !== HTTPStatusCodes.NOT_FOUND) {
		Loggers.error(err);
	}

	res.format({
		json: () => res.json(errData),
		// TODO: Provide error page
		default: () => res.json(errData)
	});
});

function logAppStarted(port, host, tunnelStarted) {
	const divider = chalk.gray("\n-----------------------------------");

	// eslint-disable-next-line no-console
	console.log(`Server started! ${chalk.green("✓")}`);

	// If the tunnel started, log that and the URL it's available at
	if (tunnelStarted) {
		// eslint-disable-next-line no-console
		console.log(`Tunnel initialised ${chalk.green("✓")}`);
	}

	// eslint-disable-next-line no-console
	console.log(`
${chalk.bold("Access URLs:")}${divider}
Localhost: ${chalk.magenta(`http://${host}:${Config.app.address.externalPort}`)}
      LAN: ${chalk.magenta(`http://${ip.address()}:${Config.app.address.externalPort}`) +
(tunnelStarted ? `\n    Proxy: ${chalk.magenta(tunnelStarted)}` : "")}${divider}
${chalk.blue(`Press ${chalk.italic("CTRL-C")} to stop`)}
    `);
}


// Start your app.
server.listen(Config.app.address.port, Config.app.address.host, (err) => {
	if (err) {
		return Loggers.error(err);
	}

	// Connect to ngrok in dev mode
	if (ngrok) {
		ngrok.connect(Config.app.address.port, (innerErr, url) => {
			if (innerErr) {
				return Loggers.error(innerErr);
			}

			logAppStarted(Config.app.address.port, Config.app.address.host, url);
		});
	} else {
		logAppStarted(Config.app.address.port, Config.app.address.host);
	}
});
