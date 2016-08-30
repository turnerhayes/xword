"use strict";

const _                   = require('lodash');
const assert              = require('assert');
const Q                   = require('q');
const DictionaryItemModel = require('../models/dictionary-item');

const DEFAULT_FRAME_START = 0;
const DEFAULT_FRAME_END = 10;

function _toPatternRegex(pattern) {
	pattern = pattern.toUpperCase();

	// Simple optimization for the case when a strict match is needed (no
	// blanks)
	if (!/_/.test(pattern)) {
		return pattern;
	}

	return new RegExp('^' + pattern.replace(/_/g, '.') + '$');	
}

class DictionaryStore {
	static findTerm(options) {
		options = options || {};

		let frame = _.defaults({}, options.frame, {
			start: DEFAULT_FRAME_START,
			length: DEFAULT_FRAME_END
		});

		let termCheck = {};

		termCheck.term = _toPatternRegex(options.pattern || '');

		let query = DictionaryItemModel.find(termCheck).limit(frame.length);

		if (frame.start > 0) {
			query = query.skip(frame.start);
		}

		return Q(query);
	}

	static findTerms(options) {
		let termCheck = {};
		let frame;

		options = options || {};

		frame = _.defaults({}, options.frame, {
			start: DEFAULT_FRAME_START,
			length: DEFAULT_FRAME_END
		});

		if (frame.length === Infinity) {
			delete frame.length;
		}


		if (options.pattern) {
			termCheck.term = _toPatternRegex(options.pattern);
		}

		if (options.termLengths) {
			termCheck.termLength = {
				$in: _.isArray(options.termLengths) ?
					options.termLengths :
					[options.termLengths]
			};
		}
		
		let query = DictionaryItemModel.find(termCheck, { _id: false, termLength: false });

		if (!_.isUndefined(frame.length)) {
			query.limit(frame.length);
		}

		if (frame.start > 0) {
			query = query.skip(frame.start);
		}

		return Q(query);
	}

	static updateDefinitions(options) {
		assert(options, 'DictionaryStore.updateDefinitions() cannot be called without options');

		let data = options.data;

		let terms = _.keys(data);

		assert(data, 'No updates specified for DictionaryStore.updateDefinitions()');

		return Q.all(
			_.map(
				terms,
				function(term) {
					DictionaryItemModel.update(
						{
							term: term
						},
						{
							definitions: data[term]
						}
					).exec();
				}
			)
		);
	}

	static addDefinitions(options) {
		assert(options, 'DictionaryStore.addDefinitions() cannot be called without options');

		let data = options.data;

		let terms = _.keys(data);

		assert(data, 'No updates specified for DictionaryStore.addDefinitions()');

		return Q(
			DictionaryItemModel.find({
				term: { $in: terms }
			})
		).then(
			function(items) {
				return Q.all(
					_.map(
						items,
						function(item) {
							if (item) {
								item.definitions = _.uniq(
									item.definitions.concat(data[item.term])
								);

								terms = _.without(terms, item.term);

								return item.save();
							}

							return Q();
						}
					)
				);
			}
		).then(
			function() {
				return Q.all(
					_.map(
						terms,
						function(term) {
							if (!data[term]) {
								return Q();
							}

							return DictionaryItemModel.create({
								term: term,
								definitions: data[term]
							});
						}
					)
				);
			}
		);
	}

	static verifyValidTerms(options) {
		options = options || {};

		let terms = _.map(_.uniq(options.terms || []), (t) => t.toUpperCase());

		assert(_.size(terms) > 0, "No terms specified to check in `verifyValidTerms`");

		let query = DictionaryItemModel.find(
			{
				term: {
					$in: terms
				}
			},
			{
				term: true,
				_id: false
			}
		);

		return Q(query).then(
			function(foundTerms) {
				return {
					missingTerms: _.difference(terms, _.map(foundTerms, 'term')),
				};
			}
		);
	} 
}

exports = module.exports = DictionaryStore;
