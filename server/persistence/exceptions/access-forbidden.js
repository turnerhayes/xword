"use strict";

class AccessForbiddenException extends Error {

	constructor(message) {
		super(message);

		this.code = AccessForbiddenException.CODE;
	}

	static isThisException(err) {
		return err.code === AccessForbiddenException.CODE;
	}
}

AccessForbiddenException.CODE = "NOT-ALLOWED";

exports = module.exports = AccessForbiddenException;
