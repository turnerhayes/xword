"use strict";

const without             = require("lodash.without");
const uniq                = require("lodash.uniq");
const difference          = require("lodash.difference");
const assert              = require("assert");
const Promise             = require("bluebird");
const DictionaryItemModel = require("../models/dictionary-item");

const DEFAULT_FRAME_START = 0;
const DEFAULT_FRAME_LENGTH = 10;

function _toPatternRegex(pattern) {
	pattern = pattern.toUpperCase();

	// Simple optimization for the case when a strict match is needed (no
	// blanks)
	if (!/_/.test(pattern)) {
		return pattern;
	}

	return new RegExp("^" + pattern.replace(/_/g, ".") + "$");	
}

function defaultFrame(frame) {
	frame = frame || {};

	if (frame.start === undefined) {
		frame.start = DEFAULT_FRAME_START;
	}

	if (frame.length === undefined) {
		frame.length = DEFAULT_FRAME_LENGTH;
	}

	if (frame.length === Infinity) {
		delete frame.length;
	}

	return frame;
}

class DictionaryStore {
	static findTerm(options) {
		options = options || {};

		let frame = defaultFrame(options.frame);
		let termCheck = {};

		termCheck.term = (options.term && options.term.toUpperCase()) ||
			_toPatternRegex(options.pattern || "");

		let query = DictionaryItemModel.find(termCheck).limit(frame.length);

		if (frame.start > 0) {
			query = query.skip(frame.start);
		}

		return query.exec();
	}

	static findTerms(options) {
		let termCheck = {};

		options = options || {};

		options.frame = defaultFrame(options.frame);

		if (options.pattern) {
			termCheck.term = _toPatternRegex(options.pattern);
		}

		if (options.termLengths) {
			termCheck.termLength = {
				$in: Array.isArray(options.termLengths) ?
					options.termLengths :
					[options.termLengths]
			};
		}
		
		let query = DictionaryItemModel.find(termCheck);

		if (options.frame.length !== undefined) {
			query.limit(options.frame.length);
		}

		if (options.frame.start > 0) {
			query = query.skip(options.frame.start);
		}

		return query.exec();
	}

	static updateDefinitions(options) {
		assert(options, "DictionaryStore.updateDefinitions() cannot be called without options");

		const terms = Object.keys(options.data).map((term) => term.toUpperCase());

		assert(options.data && (terms.length > 0), "No updates specified for DictionaryStore.updateDefinitions()");

		return Promise.all(
			terms.map(
				(term) => DictionaryItemModel.update(
					{
						term,
					},
					{
						definitions: options.data[term],
					}
				).exec()
			)
		);
	}

	static addDefinitions(options) {
		assert(options, "DictionaryStore.addDefinitions() cannot be called without options");

		let terms = Object.keys(options.data).map((term) => term.toUpperCase());

		assert(options.data && (terms.length > 0), "No updates specified for DictionaryStore.addDefinitions()");

		return DictionaryItemModel.find({
			term: { $in: terms }
		}).then(
			(items) => Promise.all(
				items.map(
					(item) => {
						if (item) {
							item.definitions = uniq(
								item.definitions.concat(options.data[item.term])
							);

							terms = without(terms, item.term);

							return item.save();
						}
					}
				)
			)
		).then(
			() => Promise.all(
				terms.map(
					(term) => {
						if (!options.data[term]) {
							return;
						}

						return DictionaryItemModel.create({
							term,
							definitions: options.data[term],
						});
					}
				)
			)
		);
	}

	static verifyValidTerms(options) {
		options = options || {};

		let terms = ((options.terms && uniq(options.terms)) || []).map((term) => term.toUpperCase());

		assert(terms.length > 0, "No terms specified to check in `verifyValidTerms`");

		return DictionaryItemModel.find(
			{
				term: {
					$in: terms
				}
			}
		).then(
			(foundTerms) => ({
				missingTerms: difference(terms, foundTerms.map((result) => result.term)),
			})
		);
	} 
}

exports = module.exports = DictionaryStore;
