"use strict";

const _        = require('lodash');
const Backbone = require('backbone');


const _defaults = {
	terms: 
};

class DictionaryModel extends Backbone.Model {
	get defaults() {
		return _defaults;
	}
}

exports = module.exports = DictionaryModel;
