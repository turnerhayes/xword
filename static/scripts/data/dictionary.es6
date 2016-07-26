"use strict";

const $                    = require('jquery');
const dictionaryCollection = require('../collections/dictionary-terms').default;

let _fetchedTermLengths = [];


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

class DictionaryData {
	static findByTermLengths(termLengths, options) {
		let unfetchedTermLengths = _.without.apply(_, _.concat([termLengths], _fetchedTermLengths));

		let promise;

		if (_.size(unfetchedTermLengths) === 0) {
			promise = Q();
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
			
			promise = dictionaryCollection.fetchPromise(options);
		}

		return promise.then(
			function() {
				return _filterByLengths(dictionaryCollection, termLengths);
			}
		);
	}

	static checkTerms(terms) {
		
	}
}

exports = module.exports = DictionaryData;
