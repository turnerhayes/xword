"use strict";

const passport  = require("passport");
const debug     = require("debug")("xword:server:middleware:passport");
const rfr       = require("rfr");
const UserStore = rfr("server/persistence/stores/user");
const Config    = rfr("server/lib/config");

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	UserStore.findByID(id).then((user) => {
		done(null, user);
	}).catch(done);
});

function getUserInfoFromOAuth20Profile(profile) {
	const email = profile.emails && profile.emails.length && profile.emails[0].value;

	return {
		id: profile.id,
		username: profile.username || email || profile.id,
		email,
		displayName: profile.displayName,
		name: {
			givenName: profile.name && profile.name.givenName,
			familyName: profile.name && profile.name.familyName,
			middleName: profile.name && profile.name.middleName,
		}
	};
}

function getOrCreateUser({ req, provider, profile }) {
	return UserStore.findByProviderID(provider, profile.id).then(
		user => Promise.resolve(
			user || UserStore.createUser({
				username: profile.username,
				email: profile.email,
				provider,
				providerID: profile.id,
				name: {
					first: profile.name.givenName,
					middle: profile.name.middleName,
					last: profile.name.familyName,
					display: profile.displayName
				}
			})
		).then(
			(user) => UserStore.convertSessionUserToSiteUser({
				userID: user.id,
				sessionID: req.session.id
			}).then(
				() => user
			)
		)
	);
}

if (Config.auth.facebook.isEnabled) {
	const FacebookStrategy = require("passport-facebook-rwky");

	passport.use(new FacebookStrategy(
		{
			clientID: Config.auth.facebook.appId,
			clientSecret: Config.auth.facebook.appSecret,
			callbackURL: Config.app.address.origin + Config.auth.facebook.callbackURL,
			passReqToCallback: true,
			profileFields: ["id", "email", "name", "displayName"],
			enableProof: true
		},
		(req, accessToken, refreshToken, profile, done) => {

			getOrCreateUser({
				req,
				provider: "facebook",
				profile: getUserInfoFromOAuth20Profile(profile)
			}).then(
				(user) => done(null, user)
			).catch(done);
		}
	));
}

if (Config.auth.google.isEnabled) {
	const GoogleOAuthStrategy = require("passport-google-oauth20");

	passport.use(new GoogleOAuthStrategy(
		{
			clientID: Config.auth.google.clientID,
			clientSecret: Config.auth.google.clientSecret,
			callbackURL: Config.app.address.origin + Config.auth.google.callbackURL,
			passReqToCallback: true,
		},
		(req, accessToken, refreshToken, profile, done) => {
			getOrCreateUser({
				req,
				provider: "google",
				profile: getUserInfoFromOAuth20Profile(profile)
			}).then(
				(user) => done(null, user)
			).catch(done);
		}
	));
}

if (Config.auth.twitter.isEnabled) {
	const TwitterStrategy = require("passport-twitter");

	passport.use(new TwitterStrategy(
		{
			consumerKey: Config.auth.twitter.consumerKey,
			consumerSecret: Config.auth.twitter.consumerSecret,
			callbackURL: Config.app.address.origin + Config.auth.twitter.callbackURL,
			passReqToCallback: true
		},
		(req, token, tokenSecret, profile, done) => {
			getOrCreateUser({
				req,
				provider: "twitter",
				profile: getUserInfoFromOAuth20Profile(profile)
			}).then(
				(user) => done(null, user)
			).catch(done);
		}
	));
}

module.exports = exports = function addPassportMiddleware(app) {
	debug("Adding Passport.js middleware");
	app.use(passport.initialize());
	app.use(passport.session());
};
