"use strict";

var _                   = require('lodash');
var assert              = require('assert');
var Q                   = require('q');
var DictionaryItemModel = require('../models/dictionary-item');

var DEFAULT_FRAME_START = 0;
var DEFAULT_FRAME_END = 10;

function _toPatternRegex(pattern) {
	pattern = pattern.toUpperCase();

	// Simple optimization for the case when a strict match is needed (no
	// blanks)
	if (!/_/.test(pattern)) {
		return pattern;
	}

	return new RegExp('^' + pattern.replace(/_/g, '.') + '$');	
}

var DictionaryStore = Object.create(Object.prototype, {
	findTerm: {
		value: function(options) {
			options = options || {};

			var frame = _.defaults({}, options.frame, {
				start: DEFAULT_FRAME_START,
				length: DEFAULT_FRAME_END
			});

			var termCheck = {};

			termCheck.term = _toPatternRegex(options.pattern || '');

			var query = DictionaryItemModel.find(termCheck).limit(frame.length);

			if (frame.start > 0) {
				query = query.skip(frame.start);
			}

			return Q(query);
		}
	},

	findTerms: {
		value: function(options) {
			var termCheck = {};
			var frame;

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
			
			var query = DictionaryItemModel.find(termCheck, { _id: false, termLength: false });

			if (!_.isUndefined(frame.length)) {
				query.limit(frame.length);
			}

			if (frame.start > 0) {
				query = query.skip(frame.start);
			}

			return Q(query);
		}
	},

	updateDefinitions: {
		value: function(options) {
			assert(options, 'DictionaryStore.updateDefinitions() cannot be called without options');

			var data = options.data;

			var terms = _.keys(data);

			console.log('data:', data);
			console.log('terms: ', _.keys(data));

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
						).exec()
					}
				)
			);
		}
	},

	addDefinitions: {
		value: function(options) {
			assert(options, 'DictionaryStore.addDefinitions() cannot be called without options');

			var data = options.data;

			var terms = _.keys(data);

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
	}
});

exports = module.exports = DictionaryStore;
