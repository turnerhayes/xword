"use strict";

import $                    from "jquery";
import _                    from "lodash";
import Q                    from "q";
import DictionaryCollection from "../collections/dictionary-terms";


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
			
			promise = DictionaryCollection.default.fetchPromise(options);
		}

		return promise.then(
			function() {
				return _filterByLengths(DictionaryCollection.default, termLengths);
			}
		);
	}

	static verifyValidTerms(terms) {
		return Q(
			$.post(
				{
					url: '/dictionary/terms/check',
					contentType: 'application/json',
					data: JSON.stringify({
						terms: terms
					})
				}
			)
		).then(
			function(results) {
				return _.size(results.missingTerms) === 0 ? undefined : results.missingTerms;
			}
		);
	}
}

exports = module.exports = DictionaryData;
