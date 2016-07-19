"use strict";

const _                   = require('lodash');
const Q                   = require('q');
const BaseCollection      = require('./base');
const DictionaryTermModel = require('../models/dictionary-term');


let _defaultCollection;

function _filterByLengths(collection, termLengths) {
	return collection.reduce(
		function(termsByLength, term) {
			let termLength = term.get('term').length;
			if (_.includes(termLengths, termLength)) {
				termsByLength[termLength] = termsByLength[termLength] || [];

				termsByLength[termLength].push(term);
			}

			return termsByLength;
		},
		{}
	);
}

class DictionaryTermCollection extends BaseCollection {
	initialize() {
		const collection = this;

		collection._fetchedTermLengths = [];
	}

	get model() {
		return DictionaryTermModel;
	}

	url() {
		return "/dictionary/terms";
	}

	static get default() {
		if (_.isUndefined(_defaultCollection)) {
			_defaultCollection = new DictionaryTermCollection();
		}

		return _defaultCollection;
	}

	fetch(options) {
		const collection = this;

		options = _.extend(options || {}, {
			data: {}
		});

		let termLengths = options.termLengths;
		delete options.termLengths;



		if (_.size(termLengths) > 0) {
			options.data.termLengths = termLengths;
		}

		let limit = options.limit;
		delete options.limit;

		if (!_.isUndefined(limit)) {
			options.data.limit = limit;
		}

		return super.fetch(options);
	}

	findByTermLengths(termLengths, options) {
		const collection = this;

		let unfetchedTermLengths = _.without.apply(_, _.concat([termLengths], collection._fetchedTermLengths));

		let promise;

		if (_.size(unfetchedTermLengths) === 0) {
			promise = Q(collection.filter());
		}
		else {
			options = _.extend(
				_.defaults(
					options || {},
					{
						limit: -1
					}
				),
				{
					termLengths: unfetchedTermLengths
				}
			);
			
			promise = collection.fetchPromise(options);
		}

		return promise.then(
			function() {
				return _filterByLengths(collection, termLengths);
			}
		);
	}
}


exports = module.exports = DictionaryTermCollection;
