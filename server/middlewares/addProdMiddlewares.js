"use strict";

const path = require("path");
const express = require("express");
const compression = require("compression");
const rfr = require("rfr");
const {
	prepareUserForFrontend
} = rfr("server/routes/utils");
const Config = rfr("server/lib/config");
const { getIndex, handleGetIndexError } = require("./utils");

module.exports = function addProdMiddlewares(app, options) {
	const publicPath = options.publicPath || "/";
	const outputPath = options.outputPath || path.resolve(Config.paths.root, "dist");

	// compression middleware compresses your server responses which makes them
	// smaller (applies also to assets). You can read more about that technique
	// and other good practices on official Express.js docs http://mxs.is/googmy
	app.use(compression());
	app.use(publicPath, express.static(outputPath));

	app.get("/service-worker/sw.js", (req, res) => {
		res.sendFile(path.join(outputPath, "service-worker", "sw.js"));
	});

	app.get("*", (req, res, next) => {
		getIndex({
			indexPath: path.join(outputPath, Config.paths.indexFile.name),
			context: {
				user: req.user && prepareUserForFrontend({
					user: req.user,
					request: req,
				}),
			}
		})
			.catch((error) => handleGetIndexError({ error, req, res, next }))
			.then(
				(content) => res.send(content)
			);
	});
};
