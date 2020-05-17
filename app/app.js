/* global module, process, require, Promise */

/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import "babel-polyfill";

// Import all the third party stuff
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router/immutable";
import { IntlProvider } from "react-intl";
import { create as createJSS } from "jss";
import { jssPreset } from "@material-ui/core";
import {JssProvider} from "react-jss";
import nestedJSS from "jss-nested";
import "sanitize.css/sanitize.css";

// Import root app
import App from "@app/components/App";

import getStore, { history } from "@app/store";

const jss = createJSS(jssPreset());
jss.use(nestedJSS());

// Create redux store with history
const store = getStore();
const MOUNT_NODE = document.getElementById("app");

// Import i18n messages
import { translationMessages } from "./i18n";

const render = (messages) => {
	const locale = navigator.language;
	const localeMessages = Object.assign(
		{},
		messages[locale],
		// Augment locale-specific messages (e.g. "en-US") with
		// language-specific messages (e.g. "en")
		locale.indexOf("-") >= 0 && messages[locale.split("-")[0]],
	);

	ReactDOM.render(
		(
			<Provider store={store}>
				<IntlProvider
					locale={locale}
					messages={localeMessages}
				>
					<JssProvider jss={jss}>
						<ConnectedRouter history={history}>
							<App />
						</ConnectedRouter>
					</JssProvider>
				</IntlProvider>
			</Provider>
		),
		MOUNT_NODE
	);
};

if (module.hot) {
	// Hot reloadable React components
	// modules.hot.accept does not accept dynamic dependencies,
	// have to be constants at compile-time
	module.hot.accept(["@app/components/App"], () => {
		ReactDOM.unmountComponentAtNode(MOUNT_NODE);
		render(translationMessages);
	});
}

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
	Promise.resolve(import("intl"))
		.then(() => render(translationMessages));
} else {
	render(translationMessages);
}

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === "production") {
	require("offline-plugin/runtime").install(); // eslint-disable-line global-require
}
