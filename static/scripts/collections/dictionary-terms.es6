"use strict";

/**
 * Collection of terms
 *
 * @module collections/dictionary-terms
 */

import _                   from "lodash";
import BaseCollection      from "./base";
import DictionaryTermModel from "../models/dictionary-term";


let _defaultCollection;

/**
 * Dictionary term collection class
 *
 * @extends module:collections/base~BaseCollection
 */
class DictionaryTermCollection extends BaseCollection {
	/**
	 * Initializes the collection.
	 *
	 * @override
	 *
	 * @see {@link http://backbonejs.org/#Collection-initialize}
	 */
	initialize() {
		const collection = this;

		collection._fetchedTermLengths = [];
	}

	/**
	 * Gets the model used for members of this collection.
	 *
	 * @override
	 *
	 * @type function
	 */
	get model() {
		return DictionaryTermModel;
	}

	/**
	 * Gets the base URL for the model resources
	 *
	 * @override
	 *
	 * @returns {string} the relative URL
	 */
	url() {
		return "/dictionary/terms";
	}

	/**
	 * Gets the default collection instance
	 *
	 * @type module:collections/dictionary-terms~DictionaryTermCollection
	 */
	static get default() {
		if (_.isUndefined(_defaultCollection)) {
			_defaultCollection = new DictionaryTermCollection();
		}

		return _defaultCollection;
	}

	/**
	 * Retrieves collection items
	 *
	 * @override
	 *
	 * @param {object} [options] - options to affect the fetch process
	 */
	fetch(options) {
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
}


export default DictionaryTermCollection;
