"use strict";

import _        from "lodash";
import Q        from "q";
import Backbone from "backbone";


class BaseCollection extends Backbone.Collection {
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

exports = module.exports = BaseCollection;
