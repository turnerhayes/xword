"use strict";

const session            = require("express-session");
const MongoStore         = require("connect-mongo")(session);
const rfr                = require("rfr");
const Config             = rfr("server/lib/config");

// eslint-disable-next-line no-magic-numbers
const THIRTY_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

exports = module.exports = session({
	store: new MongoStore({
		url: Config.session.db.url
	}),
	secret: Config.session.secret,
	name: Config.session.cookieName,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: THIRTY_DAYS_IN_MILLISECONDS,
		secure: false
	}
});
