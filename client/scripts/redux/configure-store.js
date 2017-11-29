// process.env.[FOO] is used by webpack during the build, and will be replaced with a constant
/* globals process */

import Immutable               from "immutable";
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
import { composeWithDevTools } from "redux-devtools-extension";
import localForage             from "localforage";
import { routerMiddleware }    from "react-router-redux";
import createHistory           from "history/createBrowserHistory";
import { ImmutablePuzzle }     from "xpuz";
import rootReducer             from "project/scripts/redux/reducers";
import * as actionCreators     from "project/scripts/redux/actions";
import allRecords              from "project/scripts/records";

export const history = createHistory();

const middlewares = [
	thunkMiddleware,
	promiseMiddleware,
	routerMiddleware(history),
];

let composer = compose;

if (process.env.IS_DEVELOPMENT) {
	composer = composeWithDevTools({
		actionCreators,
		serialize: {
			immutable: Immutable,
			refs: [
				...allRecords,
				ImmutablePuzzle,
			].map(
				(RecordConstructor) => (data) => {
					return new RecordConstructor(data);
				}
			),
		},
	});
}

const composedEnhancers = composer(applyMiddleware(...middlewares));

export default function configureStore(initialState) {
	let store = createStore(
		rootReducer,
		initialState || Immutable.Map(),
		composedEnhancers
	);

	const rehydrateTransform = createTransform(
		(inboundState) => {
			// We don't want to persist isRehydrated to the store; it's intended to be a sort of transient
			// state key that gets set to true every time the state is rehydrated
			return inboundState.toMap().delete("isRehydrated");
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
			],
			records: [
				...allRecords,
				ImmutablePuzzle,
			],
		},
	);

	return store;
}
