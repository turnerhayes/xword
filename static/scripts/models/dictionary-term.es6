"use strict";

import Backbone from "backbone";


const _defaults = {
	term: "",
	definitions: []
};

class DictionaryTerm extends Backbone.Model {
	get defaults() {
		return _defaults;
	}

	get idAttribute() {
		return "term";
	}
}

exports = module.exports = DictionaryTerm;
