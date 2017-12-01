"use strict";

const express                  = require("express");
const bodyParser               = require("body-parser");
const rfr                      = require("rfr");
const UsersStore               = rfr("server/lib/persistence/stores/user");
const AccessForbiddenException = rfr("server/lib/persistence/exceptions/access-forbidden");

const router = express.Router();

router.route("/:userID")
	.patch(
		bodyParser.urlencoded({
			extended: true,
			type: "application/x-www-form-urlencoded"
		}),
		bodyParser.json({ type: "application/json" }),
		(req, res, next) => {
			const userID = req.params.userID;
			const updates = req.body;

			if (req.user && req.user.id !== userID) {
				next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
			}

			UsersStore.findByID(userID).then(
				(user) => {
					if (user.isAnonymous && req.session.id !== user.sessionID) {
						next(new AccessForbiddenException("You do not have permissions to edit this user's information"));
						return;
					}

					return UsersStore.updateUser({ userID, updates }).then(
						(user) => res.json(user.toFrontendObject())
					);
				}
			).catch(next);
		}
	);

router.route("")
	.get(
		(req, res, next) => {
			const ids = (req.query.ids || "").split(",");

			UsersStore.findByIDs({
				ids
			}).then(
				(users) => res.json(users.map((user) => user.toFrontendObject()))
			).catch(next);
		}
	);

exports = module.exports = router;
