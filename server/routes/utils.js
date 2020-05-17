"use strict";

const HTTPStatusCodes = require("http-status-codes");
const Promise         = require("bluebird");
const Config          = require("../lib/config");
const UserStore       = require("../persistence/stores/user");

const USER_ID_HEADER = "X-API-User-ID";

function prepareUserForFrontend({ user, request }) {
	if (typeof user.toFrontendObject === "function") {
		user = user.toFrontendObject();
	}

	user.isMe = request.user ?
		request.user.id === user.id :
		request.sessionID === user.sessionID;

	return user;
}


exports = module.exports = {
	mustAuthenticate(message) {
		message = message || "You must be logged in to perform this action";

		return (req, res, next) => {
			if (!req.user) {
				const createError = () => {
					const err = new Error(message);
					err.status = HTTPStatusCodes.UNAUTHORIZED;

					return err;
				};


				if (Config.app.isDevelopment) {
					const debugUserID = req.header(USER_ID_HEADER) && Number(req.header(USER_ID_HEADER));

					// Ensure not NaN
					if (debugUserID && debugUserID === debugUserID) {
						UserStore.findByID(debugUserID).then(
							user => new Promise(
								(resolve, reject) => req.login(
									user,
									{
										session: false
									},
									err => {
										if (err) {
											reject(err);
											return;
										}

										resolve();
									}
								)
							)
						).then(
							() => next()
						).catch(
							ex => {
								// eslint-disable-next-line no-console
								console.error(`Failed to log in user using header ID ${debugUserID}:`, ex);
								
								next(createError());
							}
						);

						return;
					}
				}

				next(createError());
			}

			next();
		};
	},

	prepareUserForFrontend,

	prepareGameForFrontend({ game, request }) {
		game = game.toFrontendObject();

		game.players.forEach(
			(player) => player.user = prepareUserForFrontend({ user: player.user, request })
		);

		return game;
	}
};
