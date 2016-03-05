"use strict";

var _                   = require('lodash');
var assert              = require('assert');
var Q                   = require('q');
var DictionaryItemModel = require('../models/dictionary-item');

var DictionaryStore = Object.create(Object.prototype, {
	findTerm: {
		value: function(options) {
			options = options || {};

			var frame = _.defaults({}, options.frame, {
				start: 0,
				length: 10
			});

			var termCheck = {};

			var pattern = (options.pattern || '').toUpperCase();

			if (!/_/.test(pattern)) {
				// Simple optimization for the case when a strict match is needed (no
				// blanks)
				termCheck.word = pattern;
			}
			else {
				termCheck.word = new RegExp('^' + options.pattern.replace(/_/g, '.') + '$');
			}

			var query = DictionaryItemModel.find(termCheck).limit(frame.length);

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

			assert(data, 'No updates specified for DictionaryStore.updateDefinitions()');


			return Q(
				DictionaryItemModel
					.where('word')
					.in(_.keys(options.data))
			).then(
				function(results) {
					return Q.all(
						_.map(
							results,
							function(result) {
								result.definitions = data[result.word];

								return Q(result.save());
							}
						)
					);
				}
			);
		}
	}
});

exports = module.exports = DictionaryStore;
