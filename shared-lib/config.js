"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;

if (staticContentInline) {
	staticContentURL = global.document.origin;
}
else {
	staticContentURL = staticContentURL.replace(/\/$/, "");
}


exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT
	},

	staticContent: {
		inline: staticContentInline,
		url: staticContentURL
	},
};
