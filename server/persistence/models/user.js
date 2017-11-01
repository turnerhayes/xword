"use strict";

const mongoose   = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
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
	next();
});

const UserModel = mongoose.model("User", UserSchema);

exports = module.exports = UserModel;
