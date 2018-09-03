"use strict";

const mongoose   = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		// sparse: allow multiple null values in the collection; only non-null values
		// must be unique
		sparse: true
	},
	email: {
		type: String,
		match: [/[^@]+@.+/, "{VALUE} is not a valid email address"],
		unique: true,
		sparse: true
	},
	provider: {
		type: String,
		enum: [
			"facebook",
			"google",
			"twitter"
		]
	},
	providerID: {
		type: String,
		unique: true,
		// Session users don't have a provider ID
		sparse: true
	},
	name: {
		default: null,
		type: {
			first: {
				type: String
			},
			middle: {
				type: String,
			},
			last: {
				type: String,
			},
			display: {
				type: String,
			}
		}
	},
	profilePhotoURL: {
		type: String,
		default: null,
		get: function(url) {
			if (this.provider === "facebook") {
				return "https://graph.facebook.com/" + this.providerID +"/picture?type=large";
			}
			else {
				return url;
			}
		}
	},
	sessionID: {
		type: String
	}
});

UserSchema.virtual("isAnonymous").get(
	function() {
		return !!this.sessionID;
	}
);

UserSchema.methods.toFrontendObject = function toFrontendObject() {
	const obj = this.toObject({
		virtuals: true
	});

	delete obj._id;
	delete obj.__v;
	delete obj.providerID;

	return obj;
};

UserSchema.pre("validate", function(next) {
	if (this.sessionID) {
		if (this.username) {
			next(new Error("Anonymous users must not have a username"));
			return;
		}
	}
	else {
		if (!this.username) {
			next(new Error("Users must have either a username or a sessionID"));
			return;
		}
	}

	next();
});

const UserModel = mongoose.model("User", UserSchema);

exports = module.exports = UserModel;
