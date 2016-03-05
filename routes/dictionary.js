"use strict";

var express         = require('express');
var mongoose        = require('mongoose');
var DictionaryStore = require('../lib/persistence/stores/dictionary');

var router = express.Router();

router.route('/')
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

					console.log('renderArgs:', renderArgs);

					res.render.apply(res, renderArgs);
				}
			);

			return;
		}

		res.render.apply(res, renderArgs);
	}
);

router.route('/search')
	.get(function(req, res, next) {
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
	});

router.route('/update')
	.post(function(req, res, next) {
		var terms = req.body;
		console.log('terms to update: ', terms);

		DictionaryStore.updateDefinitions({
			data: terms
		}).done(
			function() {
				res.end();
			}
		);
	});

module.exports = router;
