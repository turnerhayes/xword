"use strict";

const express  = require("express");
const passport = require("passport");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

const router = express.Router();

function route({ provider, extraAuthenticateArgs }) {
	if (Config.auth[provider].isEnabled) {
		router.route(`/auth/${provider}`)
			.get(
				(req, res, next) => { req.session.redirectTo = req.query.redirectTo; next(); },
				passport.authenticate(provider, extraAuthenticateArgs)
			);

		router.route(Config.auth[provider].callbackURL)
			.get(
				(req, res, next) => {
					passport.authenticate(
						provider,
						{
							successRedirect: req.session.redirectTo || "/",
							failureRedirect: req.session.redirectTo || "/",
							failureFlash: true,
						}
					)(req, res, next);

					delete req.session.redirectTo;
				}
			);
	}
}

route({
	provider: "facebook",
	extraAuthenticateArgs: { scope: Config.auth.facebook.scope || [] }
});

route({
	provider: "google",
	extraAuthenticateArgs: { scope: Config.auth.google.scope || [] }
});

route({
	provider: "twitter"
});

router.route("/logout")
	.get(
		(req, res) => {
			req.logout();
			res.redirect(req.query.redirectTo || "/");
		}
	);

module.exports = router;
