const express = require("express");
const rfr = require("rfr");
const HTTPStatusCodes = require("http-status-codes");
const DictionaryItemStore = rfr("server/lib/persistence/stores/dictionary");

const router = express.Router();

router.route("/term/:term")
	.get(
		(req, res, next) => {
			let term = req.params.term && req.params.term.replace(/\s/g, "");

			if (/[^a-zA-Z -]/.test(term)) {
				term = undefined;
			}

			if (!term) {
				const err = new Error("Bad term; term must contain only letters, spaces and hyphens");
				err.status = HTTPStatusCodes.BAD_REQUEST;
				next(err);
				return;
			}

			DictionaryItemStore.findTerm({
				term,
			}).then(
				(results) => {
					if (results.length === 0) {
						next();
						return;
					}

					return res.json(results[0].toFrontendObject());
				}
			).catch(next);
		}
	);

router.route("/find")
	.get(
		(req, res, next) => {
			let frameStart = req.query.start && Number(req.query.start);

			// NaN
			if (frameStart !== frameStart) {
				frameStart = undefined;
			}

			let frameLength = req.query.maxItems;

			if (frameLength === "none") {
				frameLength = Infinity;
			}
			else if (frameLength) {
				frameLength = Number(req.query.maxItems);

				// frameLength should not be NaN or 0
				if (!frameLength) {
					frameLength = undefined;
				}
			}
			else {
				frameLength = undefined;
			}

			const termLengths = (req.query.lengths ? 
				req.query.lengths.split(",").map(Number) :
				req.query.length ?
					[Number(req.query.length)] :
					[]
			).filter(Number.isInteger);

			if ((req.query.length || req.query.lengths) && termLengths.length === 0) {
				next(new Error("length/lengths parameter must be integer(s)"));
				return;
			}

			DictionaryItemStore.findTerms({
				termLengths,
				frame: {
					start: frameStart,
					length: frameLength,
				},
			}).then(
				(results) => res.json(results.map((result) => result.toFrontendObject()))
			).catch(next);
		}
	);

router.route("/find/:term")
	.get(
		(req, res, next) => {
			DictionaryItemStore.findTerms({
				pattern: req.params.term,
			}).then(
				(results) => res.json(results.map((result) => result.toFrontendObject()))
			).catch(next);
		}
	);

exports = module.exports = router;
