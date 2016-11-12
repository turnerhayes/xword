"use strict";

const session    = require('express-session');
const debug      = require('debug')('xword:session');
const MongoStore = require('connect-mongo/es5')(session);
const config     = require('./lib/utils/config');

debug('Connecting to session store at ', config.session.store.url);
const sessionStore = new MongoStore({
	url: config.session.store.url
});

const sessionInstance = session({
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
