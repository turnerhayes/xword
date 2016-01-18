"use strict";

var path = require('path');

var staticPath = path.resolve(__dirname, '..', '..', 'static');
var templatesPath = path.join(staticPath, 'templates');
var partialsPath = path.join(templatesPath, 'partials');

var Config = {
	app: {
		environment: process.env.NODE_ENV || 'development'
	},
	paths: {
		"static": staticPath,
		"templates": templatesPath,
		"partials": partialsPath
	}
};

module.exports = Config;
