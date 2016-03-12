"use strict";

var express         = require('express');
var mongoose        = require('mongoose');
var DictionaryStore = require('../lib/persistence/stores/dictionary');

var router = express.Router();

router.route('/manage')
	.get(function(req, res, next) {
		var renderArgs = [
			'manage-dictionary',
			{
				title: 'Dictionary',
				req: req
			}
		];

		if (req.query && req.query.pattern) {
			DictionaryStore.findTerm({
				pattern: req.query.pattern
			}).done(
				function(results) {
					renderArgs[1].results = results;

					res.render.apply(res, renderArgs);
				}
			);

			return;
		}

		res.render.apply(res, renderArgs);
	}
);

router.route('/add')
	.get(function(req, res, next) {
		res.render(
			'add-to-dictionary',
			{
				title: 'Add to Dictionary',
				req: req
			}
		);
	}
);

router.route('/term')
	.post(
		function(req, res, next) {
			DictionaryStore.addDefinitions({
				data: req.body
			}).done(
				function() {
					res.end();
				}
			);
		}
	);

router.route('/termList')
	.get(
		function(req, res, next) {
			var page = req.query.page || 1;

			var pattern = req.query.pattern;

			DictionaryStore.findTerm({
				pattern: pattern,
				frame: {
					start: page - 1
				}
			}).done(
				function(results) {
					res.json({
						results: results
					});
				}
			);
		}
	).post(
		function(req, res, next) {
			DictionaryStore.updateDefinitions({
				data: req.body
			}).done(
				function() {
					res.end();
				}
			);
		}
	);

router.route('/update')
	.post(function(req, res, next) {
		var terms = req.body;

		DictionaryStore.updateDefinitions({
			data: terms
		}).done(
			function() {
				res.end();
			}
		);
	});

module.exports = router;
