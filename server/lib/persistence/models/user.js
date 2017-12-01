"use strict";

let mongoose   = require("mongoose");

let UserSchema = new mongoose.Schema({
	name: {
		first: {
			type: String,
		},
		middle: {
			type: String,
		},
		last: {
			type: String,
		},
	},
	username: {
		type: String,
	},
	preferredDisplayName: {
		type: String,
		default: null
	},
	email: {
		type: String,
		match: [/[^@]+@.+/, "{VALUE} is not a valid email address"],
	},
	profilePhotoURL: {
		type: String,
	},
	facebookId: {
		type: String,
		unique: true,
		sparse: true,
	},
	googleId: {
		type: String,
		unique: true,
		sparse: true,
	},
});

UserSchema.methods.toFrontendObject = function toFrontendObject() {
	const obj = this.toObject({
		virtuals: true
	});

	obj.id = obj._id;
	delete obj._id;
	delete obj.__v;

	return obj;	
}

const UserModel = mongoose.model("User", UserSchema);

exports = module.exports = UserModel;
