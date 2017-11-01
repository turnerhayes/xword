"use strict";

class NotFoundException extends Error {
	constructor(message) {
		super(message);

		this.code = NotFoundException.CODE;
	}

	static isThisException(err) {
		return err.code === NotFoundException.CODE;
	}
}

NotFoundException.CODE = "NOT-FOUND";

exports = module.exports = NotFoundException;
