"use strict";

const bodyParser = require("body-parser");

exports = module.exports = [
	bodyParser.urlencoded({
		extended: true,
		type: "application/x-www-form-urlencoded"
	}),
	bodyParser.json({ type: "application/json" }),
];
