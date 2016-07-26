"use strict";

const _                   = require('lodash');
const Q                   = require('q');
const BaseCollection      = require('./base');
const DictionaryTermModel = require('../models/dictionary-term');


let _defaultCollection;

class DictionaryTermCollection extends BaseCollection {
	initialize() {
		const collection = this;

		collection._fetchedTermLengths = [];
	}

	get model() {
		return DictionaryTermModel;
	}

	url() {
		return "/dictionary/terms";
	}

	static get default() {
		if (_.isUndefined(_defaultCollection)) {
			_defaultCollection = new DictionaryTermCollection();
		}

		return _defaultCollection;
	}

	fetch(options) {
		const collection = this;

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


exports = module.exports = DictionaryTermCollection;
