"use strict";

const express       = require('express');
const path          = require('path');
const fs            = require('fs');
const favicon       = require('serve-favicon');
const debug         = require('debug')('xword:app');
const mongoose      = require('mongoose');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const hbs           = require('express-hbs');
const session       = require('./session');
const setupPassport = require('./passport-authentication');

const config = require('./lib/utils/config');

const routes               = require('./routes/index');
const authenticationRoutes = require('./routes/authentication');
const puzzleRoutes         = require('./routes/puzzles');
const dictionaryRoutes     = require('./routes/dictionary');

const faviconPath = path.join(__dirname, 'favicons', 'favicon.ico');

debug('Connecting to database at ', config.data.store.url);
mongoose.connect(config.data.store.url);
if (process.env.DEBUG_DB) {
	mongoose.set('debug', true);
}

const app = express();

app.use(favicon(faviconPath));

// view engine setup
app.engine('hbs', hbs.express4({
	defaultLayout: path.join(config.paths.templates, 'layout.hbs'),
	partialsDir: config.paths.partials,
}));

hbs.registerHelper(require(path.join(__dirname, "hbs-helpers"))(hbs.handlebars));

app.set('views', config.paths.templates);
app.set('view engine', 'hbs');

app.set('env', config.app.environment);
app.locals.IS_DEVELOPMENT = config.app.environment === 'development';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session.instance);
app.use('/static', express.static(config.paths.static));
// Ensure favicons can be found at the root
app.use('/', express.static(faviconPath));

setupPassport(app);

app.use('/', routes);
app.use('/', authenticationRoutes);
app.use('/puzzles/', puzzleRoutes);
app.use('/dictionary/', dictionaryRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
app.use(function(err, req, res, next) {
	var status = err.status || 500;
	res.status(status);

	res.format({
		json: function() {
			res.json({
				error: err.message
			});
		},
		default: function() {
			const errorTemplateName = path.join('errors', '' + status);
			const errorTemplatePath = path.join(config.paths.templates, errorTemplateName + '.hbs');


			fs.stat(
				errorTemplatePath,
				function(statError) {
					if (statError && statError.code === 'ENOENT') {
						errorTemplateName = 'errors/500';
					}

					res.render(errorTemplateName, {
						req: req,
						message: err.message,
						// no stacktraces leaked to user in production
						error: config.app.environment === 'development' ?
							err :
							{}
					});
				}
			);
		}
	});
});

module.exports = app;
