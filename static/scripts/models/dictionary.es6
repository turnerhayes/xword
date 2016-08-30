"use strict";

import Backbone from "backbone";


const _defaults = {
	terms: []
};

class DictionaryModel extends Backbone.Model {
	get defaults() {
		return _defaults;
	}
}

exports = module.exports = DictionaryModel;
