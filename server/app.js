"use strict";

const express            = require("express");
const path               = require("path");
// const favicon            = require("serve-favicon");
const cookieParser       = require("cookie-parser");
const handlebars         = require("handlebars");
const hbs                = require("express-hbs");
const cors               = require("cors");
const HTTPStatusCodes    = require("http-status-codes");
const rfr                = require("rfr");
const session            = rfr("server/session");
const Loggers            = rfr("server/lib/loggers");
const Config             = rfr("server/lib/config");
const passportMiddleware = rfr("server/lib/passport");
// Make sure to set up the default Mongoose connection
rfr("server/persistence/db-connection");

const app = express();

app.locals.IS_DEVELOPMENT = Config.app.isDevelopment;

const TEMPLATES_DIR = path.join(__dirname, "views");

const SITE_RESTRICTED_CORS_OPTIONS = {
	origin: Config.app.address.origin
};

function raise404(req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
}

// view engine setup
app.engine(
	"hbs",
	hbs.express4({
		partialsDir: TEMPLATES_DIR,
		layoutsDir: TEMPLATES_DIR,
		handlebars: handlebars
	})
);

handlebars.registerHelper("ToJSON", function(value, options) {
	const args = [value, (key, value) => {
		if (value === null) {
			return undefined;
		}

		return value;
	}];

	if (options.hash.pretty) {
		args.push("\t");
	}

	return JSON.stringify(...args);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.locals.STATIC_URL = Config.staticContent.url;

// app.use(favicon());
app.use(Loggers.http);
app.use(cookieParser(Config.session.secret));


app.use(session);

passportMiddleware(app);

app.use(
	"/static/fonts/font-awesome",
	express.static(
		// Need to do this ugly resolve; using requre.resolve() doesn't seem to work,
		// possibly because the font-awesome package contains no main entry or index.js,
		// so Node treats it as not a package.
		path.resolve(__dirname, "..", "node_modules", "font-awesome", "fonts"),
		{
			fallthrough: false
		}
	)
);

app.use("/", cors(SITE_RESTRICTED_CORS_OPTIONS), require("./routes/authentication"));
// Make sure no /api calls get caught by the below catch-all route handler, so that
// /api calls can 404 correctly
app.use("/api", cors(), require("./routes/api"), raise404);

if (Config.staticContent.inline) {
	app.use("/static/", express.static(Config.paths.dist), raise404);
}

app.get(
	"*",
	cors(SITE_RESTRICTED_CORS_OPTIONS),
	(req, res, next) => {

		// If what we're serving is supposed to be HTML, serve the base page.
		if (!/^\/(auth|api|static)\//.test(req.path) && req.accepts(["html", "json"]) === "html") {
			res.render("index", {
				user: req.user &&  req.user.toFrontendObject()
			});
		}
		else {
			next();
		}
	}
);

/// catch 404 and forwarding to error handler
app.use(raise404);

/// error handlers

// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
	res.status(err.status || HTTPStatusCodes.INTERNAL_SERVER_ERROR);

	const errData = {
		message: err.message,
		error: Config.app.isDevelopment ?
			{
				message: err.message,
				stack: err.stack
			} :
			{}
	};

	if (err.status !== HTTPStatusCodes.NOT_FOUND) {
		Loggers.errors.error(err);
	}

	res.format({
		json: () => res.json(errData),
		default: () => res.render("error", errData)
	});
});


module.exports = app;
