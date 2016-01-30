"use strict";

var session    = require('express-session');
var debug      = require('debug')('xword:session');
var MongoStore = require('connect-mongo/es5')(session);
var config     = require('./lib/utils/config');

debug('Connecting to session store at ', config.session.store.url);
var sessionStore = new MongoStore({
	url: config.session.store.url
});

var sessionInstance = session({
	key: config.session.key,
	store: sessionStore,
	secret: config.app.secret,
	cookie: {
		domain: '.' + config.app.address.host
	},
	saveUninitialized: true,
	resave: false
});

exports = module.exports = {
	store: sessionStore,
	instance: sessionInstance,
};
