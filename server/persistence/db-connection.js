"use strict";

const mongoose = require("mongoose");
const debug    = require("debug")("xword:db");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

mongoose.Promise = require("bluebird");

mongoose.set("debug", debug.enabled);

console.log("Config:\n", require("util").inspect(Config, {depth: null}));

exports = module.exports = mongoose.connect(Config.storage.db.url);
