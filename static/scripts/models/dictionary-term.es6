"use strict";

/**
 * Dictionary term model
 *
 * @module models/dictionary-term
 */

/**
 * Backbone model class
 *
 * @external Backbone/Model
 * @see {@link http://backbonejs.org/#Model|Model}
 */

import Backbone from "backbone";

const _defaults = {
	term: "",
	definitions: []
};

/**
 * Dictionary term model class
 *
 * @extends external:Backbone/Model
 */
class DictionaryTerm extends Backbone.Model {
	/**
	 * The term
	 *
	 * @memberOf module:models/dictionary-term~DictionaryTerm
	 * @instance
	 * @var {string} term
	 */

	/**
	 * The set of definitions for the term
	 *
	 * @memberOf module:models/dictionary-term~DictionaryTerm
	 * @instance
	 * @var {Array<string>} definitions
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

	/**
	 * The name of the attribute used as the unique identifier of a model
	 *
	 * @override
	 *
	 * @type string
	 */
	get idAttribute() {
		return "term";
	}
}

export default DictionaryTerm;
