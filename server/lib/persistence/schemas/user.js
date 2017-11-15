"use strict";

let mongoose = require("mongoose");

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
	sessionId: {
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

UserSchema.pre("validate", function(next) {
	if (
		(this.username && this.sessionId) ||
		(!this.username && !this.sessionId)
	) {
		next(new Error("User must have either a username or a session ID, but not both"));
		return;
	}

	if (this.username && !this.name.first) {
		next(new Error("Non-anonymous users (users with a username) must have a first name"));
	}

	next();
});

exports = module.exports = UserSchema;
