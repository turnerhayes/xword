// process.env.[FOO] is used by webpack during the build, and will be replaced with a constant
/* globals process */

import { Map }                 from "immutable";
import {
	compose,
	createStore,
	applyMiddleware
}                              from "redux";
import thunkMiddleware         from "redux-thunk";
import promiseMiddleware       from "redux-promise";
import {
	persistStore,
	createTransform
}                              from "redux-persist-immutable";
import { persistState }        from "redux-devtools";
import { composeWithDevTools } from "redux-devtools-extension";
import invariant               from "redux-immutable-state-invariant";
import { createLogger }        from "redux-logger";
import localForage             from "localforage";
import { routerMiddleware }    from "react-router-redux";
import createHistory           from "history/createBrowserHistory";
import rootReducer             from "project/scripts/redux/reducers";

export const history = createHistory();

function getDebugSessionKey() {
	const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
	return (matches && matches.length > 0) ? matches[1] : null;
}

const middlewares = [
	thunkMiddleware,
	promiseMiddleware,
	routerMiddleware(history),
];

let composer = compose;

if (process.env.IS_DEVELOPMENT) {
	composer = composeWithDevTools({
		serialize: true
	});
}

const enhancers = [];

if (process.env.IS_DEVELOPMENT) {
	middlewares.unshift(invariant());
	middlewares.push(createLogger());
	
	enhancers.push(
		applyMiddleware(...middlewares),
		persistState(getDebugSessionKey())
	);
}
else {
	enhancers.push(applyMiddleware(...middlewares));
}

const composedEnhancers = composer(...enhancers);

export default function configureStore(initialState) {
	let store = createStore(
		rootReducer,
		initialState || Map(),
		composedEnhancers
	);

	const rehydrateTransform = createTransform(
		(inboundState) => {
			// We don't want to persist isRehydrated to the store; it's intended to be a sort of transient
			// state key that gets set to true every time the state is rehydrated
			inboundState = inboundState.toMap().delete("isRehydrated");

			return inboundState;
		}
	);

	persistStore(
		store,
		{
			storage: localForage,
			whitelist: [
				"puzzles",
				"ui",
			],
			transforms: [
				rehydrateTransform,
			]
		},
	);

	return store;
}
