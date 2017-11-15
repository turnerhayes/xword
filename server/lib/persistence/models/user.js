"use strict";

let mongoose   = require("mongoose");
let UserSchema = require("../schemas/user");

let UserModel = mongoose.model("User", UserSchema);

Object.defineProperties(UserModel.prototype, {
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

exports = module.exports = UserModel;
