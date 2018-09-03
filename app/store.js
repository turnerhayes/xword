/**
 * Configures the Redux store for use on the browser. Separate from configure-store.js both so
 * that configure-store.js could be used server-side (without a DOM reference) and so that other
 * client-side modules can get a reference to the store if needed.
 */

import { Map, fromJS }       from "immutable";
import createHistory         from "history/createBrowserHistory";
import configureStore        from "@app/configure-store";

export const history = createHistory();

const context = JSON.parse(document.body.dataset.context || "{}");

const currentUser = context && context.user ? fromJS(context.user) : null;

const initialState = Map(
	{
		users: Map(
			{
				currentID: currentUser && currentUser.get("id"),
				items: currentUser ? Map([[currentUser.get("id"), currentUser]]) : Map()
			}
		)
	}
);

let store;
let persistor;

function initStoreAndPersistor() {
	const configured = configureStore(initialState, history);

	store = configured.store;
	persistor = configured.persistor;
}

export default function getStore() {
	if (!store) {
		initStoreAndPersistor();
	}

	return store;
}

export function getPersistor() {
	if (!persistor) {
		initStoreAndPersistor();
	}

	return persistor;
}
