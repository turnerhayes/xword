"use strict";

const { FORBIDDEN } = require("http-status-codes");
const { raise404 } = require("../routes");
const Loggers = require("../lib/loggers");
const NotFoundException = require("../persistence/exceptions/not-found");
const AccessForbiddenException = require("../persistence/exceptions/access-forbidden");

let indexPartsPromise;

exports = module.exports = {
	getIndex({ indexPath, context, fs = require("fs") }) {
		// This looks a little ugly, but it's essentially a very simple templating system. The index
		// file is meant to be mostly static, but in order to pass dynamic data (such as logged in user
		// information) we need to be able to substitute in data. We *could* use a templating library
		// like Mustache/Dust/whatever, but that seems like overkill for these purposes. Fortunately,
		// this setup allows us to substitute in an actual templating library pretty easily if needed.
		if (!indexPartsPromise) {
			indexPartsPromise = new Promise(
				(resolve, reject) => {
					fs.readFile(indexPath, "utf8", (err, content) => {
						if (err) {
							// Handle specific errors with special exceptions where possible
							if (err.code === "ENOENT") {
								reject(new NotFoundException(`Unable to find index file ${indexPath}`));
								return;
							}

							if (err.code === "EACCES") {
								reject(new AccessForbiddenException(`Not allowed to access index file ${indexPath}`));
								return;
							}

							reject(new Error(err.message));
							return;
						}

						resolve(content.split("~~context~~"));
					});
				}
			);
		}

		return indexPartsPromise.then(
			(parts) => parts.join(JSON.stringify(context).replace(/"/g, "&quot;"))
		);
	},

	handleGetIndexError({ error, req, res, next }) {	
		Loggers.error(error.message);

		if (NotFoundException.isThisException(error)) {
			return raise404(req, res, next);
		}

		if (AccessForbiddenException.isThisException(error)) {
			error = new Error("Access Forbidden");
			error.status = FORBIDDEN;
		}

		next(error);
	}
};
