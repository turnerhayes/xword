"use strict";

const mongoose = require("mongoose");
const debug    = require("debug")("xword:db");
const Config   = require("../lib/config");

mongoose.Promise = require("bluebird");

mongoose.set("debug", debug.enabled);

exports = module.exports = mongoose.connect(Config.storage.db.url);
