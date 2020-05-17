"use strict";

const express  = require("express");
const passport = require("passport");
const assert   = require("assert");
const Config   = require("../lib/config");

exports = module.exports = function getAuthenticationRouter(mountPrefix) {
	assert(mountPrefix !== undefined, "Must pass a mount prefix");

	const router = express.Router();

	function route({ provider, extraAuthenticateArgs }) {
		if (Config.auth[provider].isEnabled) {
			router.route(`/${provider}`)
				.get(
					(req, res, next) => { req.session.redirectTo = req.query.redirectTo; next(); },
					passport.authenticate(provider, extraAuthenticateArgs)
				);

			// Passport expects the callbackURL to be absolute, but if this is mounted on a prefix,
			// we can't route to the callbackURL directly, because it'll be prefixed (i.e., if this router is
			// mounted on "/auth", and the callbackURL is "/auth/facebook", then this route will end up being
			// "/auth/auth/facebook", which will not give us what we need). So we have to strip off the prefix
			// when setting up the route, since there's no way of knowing where this router will be mounted apart
			// from passing it in above.
			const callbackURL = Config.auth[provider].callbackURL.replace(
				new RegExp(`^${mountPrefix}`), ""
			);

			router.route(callbackURL)
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

	return router;
};
