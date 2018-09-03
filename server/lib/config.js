"use strict";

const path         = require("path");

const DEFAULT_PORT = 4000;

const HTTP_DEFAULT_PORT = 80;
const HTTPS_DEFAULT_PORT = 443;

const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const HOST = process.env.APP_ADDRESS_HOST;
const EXTERNAL_PORT = Number(process.env.APP_ADDRESS_EXTERNAL_PORT) || PORT;

const IS_SECURE = process.env.APP_ADDRESS_IS_SECURE ||
	(process.env.APP_SSL_KEY && process.env.APP_SSL_CERT);
	
const ORIGIN = (function() {
	let baseURL = "http" + (IS_SECURE ? "s" : "") + "://" +
		HOST;

	if (
		!(EXTERNAL_PORT === HTTP_DEFAULT_PORT && !IS_SECURE) &&
		!(EXTERNAL_PORT === HTTPS_DEFAULT_PORT && IS_SECURE)
	) {
		baseURL += ":" + EXTERNAL_PORT;
	}

	return baseURL;
}());

const indexFileTemplateName = "index.html.template";

// "fake" document object so that shared-config can access it when not run from the
// client (as it's doing here)
global.document = {
	origin: ORIGIN
};

const rfr          = require("rfr");
const sharedConfig = rfr("shared-lib/config");


const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const APP_PATH = path.join(PROJECT_ROOT, "app");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");
const LOGS_DIRECTORY = path.resolve(PROJECT_ROOT, process.env.LOGS_DIRECTORY || "logs");

const sslKeyPath = process.env.APP_SSL_KEY ?
	path.resolve(PROJECT_ROOT, process.env.APP_SSL_KEY) :
	undefined;
const sslCertPath = process.env.APP_SSL_CERT ?
	path.resolve(PROJECT_ROOT, process.env.APP_SSL_CERT) :
	undefined;

const DB_URL = process.env.CREDENTIALS_DB_URL;

const SESSION_DB_URL = process.env.SESSION_DB_URL || DB_URL;

const credentialEnvsByProvider = {};

Object.keys(process.env).forEach(
	(key) => {
		const matches = /CREDENTIALS_([A-Z]+)_*/.exec(key);

		if (!matches) {
			return;
		}

		const provider = matches[1];

		if (provider === "DB") {
			return;
		}

		credentialEnvsByProvider[provider] = credentialEnvsByProvider[provider] || [];
		credentialEnvsByProvider[provider].push(key);
	}
);

const enabledAuths = Object.keys(credentialEnvsByProvider).reduce(
	(enabledHash, provider) => {
		enabledHash[provider.toLowerCase()] = credentialEnvsByProvider[provider].reduce(
			(wasValid, credentialKey) => wasValid && !!process.env[credentialKey],
			true
		);

		return enabledHash;
	},
	{}
);

const Config = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT,
		address: {
			host: HOST,
			insecurePort: Number(process.env.APP_ADDRESS_INSECURE_PORT),
			port: PORT,
			externalPort: EXTERNAL_PORT,
			isSecure: IS_SECURE,
			origin: ORIGIN
		},
		ssl: {
			key: sslKeyPath,
			cert: sslCertPath,
		}
	},
	game: sharedConfig.game,
	paths: {
		root: PROJECT_ROOT,
		app: APP_PATH,
		dist: DIST_PATH,
		logs: LOGS_DIRECTORY,
		indexFile: {
			name: "index.html",
			template: path.join(APP_PATH, indexFileTemplateName),
		},
	},
	auth: {
		facebook: {
			appId: process.env.CREDENTIALS_FACEBOOK_APP_ID,
			appSecret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
			callbackURL: "/auth/facebook/callback",
			isEnabled: enabledAuths.facebook,
			scope: [
				"public_profile",
				"email",
				"user_friends"
			]
		},
		google: {
			clientID: process.env.CREDENTIALS_GOOGLE_CLIENT_ID,
			clientSecret: process.env.CREDENTIALS_GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
			isEnabled: enabledAuths.google,
			scope: [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile"
			]
		},
		twitter: {
			consumerKey: process.env.CREDENTIALS_TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.CREDENTIALS_TWITTER_CONSUMER_SECRET,
			callbackURL: "/auth/twitter/callback",
			isEnabled: enabledAuths.twitter
		}
	},
	staticContent: sharedConfig.staticContent,
	storage: {
		db: {
			url: DB_URL
		}
	},
	session: {
		secret: process.env.SESSION_SECRET,
		cookieName: process.env.SESSION_COOKIE_NAME || "xword.sid",
		db: {
			url: SESSION_DB_URL
		}
	},
	shared: sharedConfig,
	logging: {
		error: {
			file: process.env.LOGGING_ERROR_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ERROR_FILE) :
				null
		},
		access: {
			file: process.env.LOGGING_ACCESS_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ACCESS_FILE) :
				null
		},
		sql: {
			file: process.env.LOGGING_SQL_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_SQL_FILE) :
				(
					sharedConfig.app.isDevelopment ?
						null :
						false
				)
		},
	}
};

exports = module.exports = Config;
