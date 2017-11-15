"use strict";

let mongoose             = require("mongoose");
let DictionaryItemSchema = require("../schemas/dictionary-item");

let DictionaryItemModel = mongoose.model("Dictionary", DictionaryItemSchema);

Object.defineProperties(DictionaryItemModel.prototype, {
	toFrontendObject: {
		enumerable: true,
		value: function() {
			let user = this;

			let obj = user.toObject({
				virtuals: true
			});

			obj.id = obj._id;
			delete obj._id;

			return obj;
		}
	},
});

exports = module.exports = DictionaryItemModel;
