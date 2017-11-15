"use strict";

const assert     = require("assert");
const mongoose   = require("mongoose");
const rfr        = require("rfr");
const UserModel  = rfr("server/persistence/models/user");

class UserStore {
	static findByID(id) {
		return UserModel.findById(id);
	}

	static findByIDs({ ids }) {
		return UserModel.find({
			_id: {
				$in: ids.map(
					(id) => mongoose.Types.ObjectId(id)
				)
			}
		});
	}

	static findByUsername(username) {
		return UserModel.findOne(
			{
				username
			},
			{
				__v: false
			}
		);
	}

	static findByProviderID(provider, providerID) {
		return UserModel.findOne({provider, providerID}, {__v: false});
	}

	static createUser({ username, email, name, provider, providerID }) {
		return UserModel.create({
			username,
			email,
			name,
			provider,
			providerID,
		});
	}

	static updateUser({ userID, sessionID, updates }) {
		assert(userID || sessionID, "Must pass a `userID` to `UserStore.updateUser()`");

		return UserStore.findByID(userID).then(
			(user) => UserModel.findByIdAndUpdate(
				user.id,
				updates,
				{
					new: true,
					runValidators: true
				}
			)
		);
	}
}

module.exports = exports = UserStore;
