"use strict";

const HTTPStatusCodes = require("http-status-codes");
const Promise         = require("bluebird");
const rfr             = require("rfr");
const Config          = rfr("server/lib/config");
const UserStore       = rfr("server/persistence/stores/user");

const USER_ID_HEADER = "X-API-User-ID";

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
	}
};
