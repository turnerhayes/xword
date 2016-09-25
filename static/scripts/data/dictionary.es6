"use strict";

/**
 * Dictionary data
 *
 * @module data/dictionary
 */

/**
 * Q promise class
 *
 * @external Q/Promise
 * @see {@link https://github.com/kriskowal/q/wiki/API-Reference|Q}
 */

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

/**
 * Dictionary data access class
 */
class DictionaryData {
	/**
	 * Retrieves the terms from the dictionary whose lengths are among the specified list of lengths
	 *
	 * @param {Array<Number>} termLengths - the term lengths to match
	 * @param {object} [options] - options for finding the terms
	 * @param {Number} [options.limit=-1] - the maximum number of terms to return. If less than 0, there
	 *	is no limit
	 *
	 * @returns {external:Q/Promise} a promise that resolves with the matching terms 
	 */
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

	/**
	 * Checks that the specified terms exist in the dictionary
	 *
	 * @param {Array<string>} terms - a list of terms to check
	 *
	 * @returns {external:Q/Promise} a promise that resolves with the results of the
	 *	check. The results are `undefined` if every term is valid; otherwise, it's an
	 *	array of terms that do not exist in the dictionary
	 */
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

export default DictionaryData;
