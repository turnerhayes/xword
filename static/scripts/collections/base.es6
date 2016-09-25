"use strict";

/**
 * Base collection class
 *
 * @module collections/base
 */

/**
 * Backbone collection class
 *
 * @external Backbone/Collection
 * @see {@link http://backbonejs.org/#Collection|Collection}
 */

/**
 * Q promise class
 *
 * @external Q/Promise
 * @see {@link https://github.com/kriskowal/q/wiki/API-Reference|Q}
 */

import _        from "lodash";
import Q        from "q";
import Backbone from "backbone";

/**
 * Base collection class
 *
 * @extends external:Backbone/Collection
 */
class BaseCollection extends Backbone.Collection {
	/**
	 * Fetches the collection and returns a promise.
	 *
	 * @param {object} [options] - options to pass to Backbone's
	 *	{@link http://backbonejs.org/#Collection-fetch|fetch()} method
	 *
	 * @returns {external:Q/Promise} a promise that resolves or rejects
	 *	based on the success of failure of `fetch()`
	 */
	fetchPromise(options) {
		const collection = this;

		const deferred = Q.defer();

		let _success, _error;

		if (options && _.isFunction(options.success)) {
			_success = options.success;
		}

		if (options && _.isFunction(options.error)) {
			_error = options.error;
		}

		options = _.extend(
			options || {},
			{
				success: function(coll) {
					deferred.resolve(coll);

					if (!_.isUndefined(_success)) {
						_success.apply(undefined, arguments);
					}
				},
				error: function(coll, response) {
					deferred.reject(response);

					if (!_.isUndefined(_error)) {
						_error.apply(undefined, arguments);
					}
				}
			}
		);


		collection.fetch(options);

		return deferred.promise;
	}
}

export default BaseCollection;
