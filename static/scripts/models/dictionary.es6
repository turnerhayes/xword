"use strict";

/**
 * Dictionary model
 *
 * @module models/dictionary
 */

/**
 * Backbone model class
 *
 * @external Backbone/Model
 * @see {@link http://backbonejs.org/#Model|Model}
 */

import Backbone from "backbone";

const _defaults = {
	terms: []
};

/**
 * Dictionary model class
 *
 * @extends external:Backbone/Model
 */
class DictionaryModel extends Backbone.Model {
	/**
	 * The list of term models in the dictionary
	 *
	 * @memberOf module:models/dictionary~DictionaryModel
	 * @instance
	 * @var {Array<module:models/dictionary-term~DictionaryTerm>} terms
	 */

	/**
	 * Default values for properties
	 *
	 * @override
	 *
	 * @type object
	 */
	get defaults() {
		return _defaults;
	}
}

export default DictionaryModel;
