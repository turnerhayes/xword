"use strict";

const _             = require('lodash');
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
const hbsHelpers    = require('../hbs-helpers');

const config = require('./lib/utils/config');

const routes               = require('./routes/index');
const authenticationRoutes = require('./routes/authentication');
const puzzleRoutes         = require('./routes/puzzles');
const dictionaryRoutes     = require('./routes/dictionary');

const faviconDirectory = path.join(config.paths.static, 'dist', 'favicons');

const faviconPath = path.join(faviconDirectory, 'favicon.ico');

mongoose.Promise = require('q').Promise;

debug('Connecting to database at ', config.data.store.url);
mongoose.connect(config.data.store.url);
if (process.env.DEBUG_DB) {
	mongoose.set('debug', true);
}

const app = express();

fs.stat(faviconPath, (err) => {
	if (!err || err.code !== 'ENOENT') {
		app.use(favicon(faviconPath));
	}
});

// view engine setup
app.engine('hbs', hbs.express4({
	defaultLayout: path.join(config.paths.templates, 'layout.hbs'),
	partialsDir: config.paths.partials,
}));

hbs.registerHelper(hbsHelpers(hbs.handlebars));

app.set('views', config.paths.templates);
app.set('view engine', 'hbs');

app.set('env', config.app.environment);

app.locals.IS_DEVELOPMENT = config.app.environment === 'development';
app.locals.STATIC_HOST = (config.static.host ?
	config.app.static.host :
	'/static/dist'
).replace(/\/$/, '');

if (app.locals.IS_DEVELOPMENT) {
	const webpack              = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig        = require('../webpack.config');

	_.each(
		webpackConfig.entry,
		(entry) => {
			entry.unshift(...[
				'webpack/hot/dev-server',
				'webpack-hot-middleware/client'
	        ]);
		}
	);

	webpackConfig.context = __dirname;

	const compiler = webpack(webpackConfig);

	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		stats: {
			colors: true
		}
	}));

	app.use(webpackHotMiddleware(compiler, {
		log: console.log,
		reload: true,
	}))
}
else {
	app.use('/static', express.static(config.paths.static, { maxAge: '7 days' }));
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session.instance);
// Ensure favicons can be found at the root
app.use('/', express.static(faviconDirectory, { maxAge: '30 days' }));

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

	console.error(err);

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
