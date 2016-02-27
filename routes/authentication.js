"use strict";

var express  = require('express');
var passport = require('passport');
var config   = require('../lib/utils/config');

var router = express.Router();

router.route('/login')
	.get(function(req, res, next) {
		res.render(
			'login',
			{
				title: 'Login',
				req: req
			}
		);
	}
);

router.route('/logout')
	.get(
		function(req, res) {
			req.logout();
			res.redirect('/');
		}
	);

router.route('/auth/fb')
	.get(
		passport.authenticate('facebook', { "scope": config.authentication.facebook.scope || [] })
	);

router.route(config.authentication.facebook.callbackURL)
	.get(
		passport.authenticate(
			'facebook',
			{
				successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: true,
			}
		)
	);

router.route('/auth/google')
	.get(
		passport.authenticate('google', { "scope": config.authentication.google.scope || "login" })
	);

router.route(config.authentication.google.callbackURL)
	.get(
		passport.authenticate(
			'google',
			{
				successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: true,
			}
		)
	);

module.exports = router;
