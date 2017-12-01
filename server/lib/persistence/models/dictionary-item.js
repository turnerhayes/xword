"use strict";

const mongoose             = require("mongoose");

const DictionaryItemSchema = new mongoose.Schema({
	term: {
		type: String,
		index: true,
		unique: true,
	},
	definitions: {
		type: [String],
	},
	termLength: {
		type: Number,
		index: true,
		required: true,
	}
}, { collection: "dictionary" });

DictionaryItemSchema.pre("save", function(next) {
	const termLength = this.term.length;

	if (termLength !== this.termLength) {
		this.termLength = termLength;
	}

	next();
});

DictionaryItemSchema.methods.toFrontendObject = function toFrontendObject() {
	const obj = this.toObject({
		virtuals: true,
	});

	obj.id = obj._id;

	delete obj._id;
	delete obj.__v;

	return obj;
};

const DictionaryItemModel = mongoose.model("Dictionary", DictionaryItemSchema);

exports = module.exports = DictionaryItemModel;
