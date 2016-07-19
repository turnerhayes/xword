"use strict";

const _        = require('lodash');
const Backbone = require('backbone');


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
