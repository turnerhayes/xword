"use strict";

const mongoose = require("mongoose");
const rfr      = require("rfr");
const debug    = require("debug")("xword:db");
const Config   = rfr("server/lib/config");

mongoose.Promise = require("bluebird");

mongoose.set("debug", debug.enabled);

exports = module.exports = mongoose.connect(Config.storage.db.url, {
	useMongoClient: true,
});
