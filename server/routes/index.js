"use strict";

const express  = require("express");
const cors = require("cors");
const Config = require("../lib/config");
const createAuthenticationRouter = require("./authentication");

const SITE_RESTRICTED_CORS_OPTIONS = {
	origin: Config.app.address.origin
};

const router = express.Router();

function raise404(req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
}

router.use(
	"/api",
	cors(SITE_RESTRICTED_CORS_OPTIONS),
	require("./api"),
	raise404
);

router.use(
	"/auth",
	createAuthenticationRouter("/auth"),
	raise404
);

exports = module.exports = {
	router,
	raise404
};
