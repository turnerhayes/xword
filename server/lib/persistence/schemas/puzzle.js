"use strict";

var mongoose = require('mongoose');
var _        = require('lodash');

var PuzzleSchema = new mongoose.Schema({
	puzzle_id: {
		type: String,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	solution: {
		type: [
			mongoose.Schema.Types.Mixed
		],
		validate: {
			validator: function(val) {
				var i, len;

				if (_.isUndefined(val)) {
					return true;
				}

				if (!_.isArray(val)) {
					return false;
				}

				if (_.isEmpty(val)) {
					return true;
				}

				for (i = 0, len = val.length; i < len; i++) {
					if (!_.isArray(val[i])) {
						return false;
					}
				}
			},
			message: "{VALUE} must be undefined or a two-dimensional array"
		}
	}
});


exports = module.exports = PuzzleSchema;
