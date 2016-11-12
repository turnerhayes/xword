"use strict";

var mongoose   = require('mongoose');
var UserSchema = require('../schemas/user');

var UserModel = mongoose.model('User', UserSchema);

Object.defineProperties(UserModel.prototype, {
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

exports = module.exports = UserModel;
