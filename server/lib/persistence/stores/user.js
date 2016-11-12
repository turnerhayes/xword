"use strict";

var Q         = require('q');
var UserModel = require('../models/user');

var UserStore = Object.create(Object.prototype, {
	getUserByID: {
		value: function(id) {
			return Q(
				UserModel.findById(id)
			);
		}
	},

	getUser: {
		value: function(options) {
			options = options || {};

			return Q(
				UserModel.findOne(options.filters, {_v: false})
			);
		}
	},

	addUser: {
		value: function(userModel) {
			return Q(
				userModel.save()
			);
		}
	},

	updateUser: {
		value: function(userModel) {
			return Q(
				userModel.update()
			);
		}
	}
});

exports = module.exports = UserStore;
