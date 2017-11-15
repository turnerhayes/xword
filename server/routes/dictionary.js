"use strict";

let _               = require("lodash");
let express         = require("express");
let DictionaryStore = require("../lib/persistence/stores/dictionary");

let router = express.Router();

router.route("/manage")
	.get((req, res, next) => {
		let renderArgs = [
			"manage-dictionary",
			{
				title: "Dictionary",
				req: req
			}
		];

		if (req.query && req.query.pattern) {
			DictionaryStore.findTerm({
				pattern: req.query.pattern
			}).then(
				(results) => {
					renderArgs[1].results = results;

					res.render(res, ...renderArgs);
				}
			).catch(next);

			return;
		}

		res.render(...renderArgs);
	}
);

router.route("/add")
	.get((req, res) => {
		res.render(
			"add-to-dictionary",
			{
				title: "Add to Dictionary",
				req: req
			}
		);
	}
);

router.route("/term")
	.post(
		(req, res, next) => {
			DictionaryStore.addDefinitions({
				data: req.body
			}).then(() => res.end())
			.catch(next);
		}
	);

router.route("/termList")
	.get(
		(req, res, next) => {
			let page = req.query.page || 1;

			let pattern = req.query.pattern;

			DictionaryStore.findTerm({
				pattern: pattern,
				frame: {
					start: page - 1
				}
			}).then(
				(results) => res.json({
					results: results
				})
			).catch(next);
		}
	).post(
		(req, res, next) => {
			DictionaryStore.updateDefinitions({
				data: req.body
			}).then(() => res.end())
			.catch(next);
		}
	);

router.route("/terms")
	.get(
		(req, res, next) => {
			let options = {};

			if (req.query.pattern) {
				options.pattern = req.query.pattern;
			}

			if (req.query.termLengths) {
				options.termLengths = _.map(req.query.termLengths, Number);
			}

			if (req.query.limit) {
				options.frame = {
					length: Number(req.query.limit)
				};

				if (options.frame.length < 0) {
					options.frame.length = Infinity;
				}
			}

			DictionaryStore.findTerms(options).then(
				(results) => res.json(results || [])
			).catch(next);
		}
	);

router.route("/terms/check")
	.post(
		(req, res, next) => {
			let terms = req.body.terms;

			DictionaryStore.verifyValidTerms({
				terms: terms
			}).then((results) => res.json(results))
			.catch(next);
		}
	);

router.route("/update")
	.post((req, res, next) => {
		let terms = req.body;

		DictionaryStore.updateDefinitions({
			data: terms
		}).then(() => res.end())
		.catch(next);
	});

module.exports = router;
