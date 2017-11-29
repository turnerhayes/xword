#!/usr/bin/nodejs

"use strict";

const rfr             = require("rfr");
rfr("utils/read-env");

const debug           = require("debug")("xword:server");
const http            = require("http");
const fs              = require("fs");
const spdy            = require("spdy");
const HTTPStatusCodes = require("http-status-codes");
const app             = rfr("server/app");
const Config          = rfr("server/lib/config");

app.set("port", Config.app.address.port);

let server;

if (Config.app.ssl.key && Config.app.ssl.cert) {
	const insecureServer = http.createServer(
		function(req, res) {
			res.writeHead(HTTPStatusCodes.MOVED_PERMANENTLY, {
				Location: "https://" + req.headers.host.replace(
					new RegExp("\\:" + Config.app.address.insecurePort + "$"),
					":" + Config.app.address.port
				) + req.url
			});
			res.end();
		}
	).listen(
		Config.app.address.insecurePort,
		function() {
			debug("Express server listening on insecure port " + insecureServer.address().port);
		}
	);

	const options = {
		key: fs.readFileSync(Config.app.ssl.key),
		cert: fs.readFileSync(Config.app.ssl.cert)
	};

	server = spdy.createServer(
		options,
		app
	).listen(
		Config.app.address.port,
		function() {
			debug("Express server listening on secure port " + server.address().port);
		}
	);
}
else {
	Config.app.address.isSecure = false;

	server = http.createServer(
		app
	).listen(
		Config.app.address.port,
		function() {
			debug("Express server listening on port " + server.address().port);
		}
	);
}
