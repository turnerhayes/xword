"use strict";

const winston = require("winston");
const morgan  = require("morgan");
const Config  = require("../lib/config");

// eslint-disable-next-line no-magic-numbers
const MAX_LOG_SIZE_BYTES = 10 * 1000 * 1000; // 10MB

let sqlLogger;

if (Config.logging.sql.file !== false) {
	const logger = winston.createLogger({
		level: "info"
	});

	if (Config.logging.sql.file === null) {
		logger.add(new winston.transports.Console());
	}
	else {
		logger.add(
			new winston.transports.File(
				{
					filename: Config.logging.sql.file,
					timestamp: true,
					maxsize: MAX_LOG_SIZE_BYTES
				}
			),
		);
	}

	sqlLogger = function(msg) {
		logger.info(msg);
	};
}

const errorLogger = winston.createLogger({
	level: "error",
	transports: [
		new winston.transports.Console({
			timestamp: true
		})
	]
});

exports = module.exports = {
	http: morgan("dev"),
	sql: sqlLogger,
	error: errorLogger.error,
};
