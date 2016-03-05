"use strict";

var mongoose             = require('mongoose');
var DictionaryItemSchema = require('../schemas/dictionary-item');

var DictionaryItemModel = mongoose.model('Dictionary', DictionaryItemSchema);

Object.defineProperties(DictionaryItemModel.prototype, {
	toFrontendObject: {
		enumerable: true,
		value: function() {
			var user = this;

			var obj = user.toObject({
				virtuals: true
			});

			obj.id = obj._id;
			delete obj._id;

			return obj;
		}
	},
});

exports = module.exports = DictionaryItemModel;
