exports = module.exports = {
	path: "node_modules/xword-dlls",
	exclude: [
		"chalk",
		"compression",
		"cross-env",
		"express",
		"ip",
		"minimist",
		"sanitize.css",
		"rfr",
		"mongoose",
		"mongodb",
		"mkdirp",
		"nodemon",
		"dotenv",
		"morgan",
		"winston",
		"cors",
		"passport",
		"passport-facebook-rwky",
		"passport-twitter",
		"passport-google-oauth20",
		"express-session",
		"connect-mongo",
		"cookie-parser",
		"npm",
		"webpack-bundle-analyzer",
		// Including all of material-ui-icons means that we can't tree-shake only the icons
		// we actually use, so we have to include the whole module (> 1MB)
		"material-ui-icons",
		// Lodash is pretty big and few parts of it are used. Exclude it so that we don't need to
		// download the entire thing whenever we request the dll.
		"lodash",
	],
	include: [
		"core-js",
		"lodash",
		"eventsource-polyfill",
	]
};
