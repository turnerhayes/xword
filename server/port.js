"use strict";

const rfr = require("rfr");
const Config = rfr("server/lib/config");
const argv = rfr("server/argv");

module.exports = argv.port ?
	parseInt(argv.port, 10) :
	Config.app.address.port;
