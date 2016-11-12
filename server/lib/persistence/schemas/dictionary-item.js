"use strict";

var mongoose = require('mongoose');

var DictionaryItemSchema = new mongoose.Schema({
	term: {
		type: String,
		index: true,
		unique: true
	},
	definitions: {
		type: [String]
	}
}, { collection: 'dictionary' });

exports = module.exports = DictionaryItemSchema;
