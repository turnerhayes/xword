"use strict";

const Config = require("./lib/config");
const argv = require("./argv");

module.exports = argv.port ?
	parseInt(argv.port, 10) :
	Config.app.address.port;
