"use strict";

let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;

if (staticContentInline) {
	staticContentURL = "";
}

// Normalize URL to not end with a slash
staticContentURL = staticContentURL.replace(/\/$/, "");

exports = module.exports = {
	staticContent: {
		inline: staticContentInline,
		url: staticContentURL
	},
};
