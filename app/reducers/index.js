/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from "redux-immutable";
import { connectRouter } from "connected-react-router/immutable";
import { createBrowserHistory } from "history";
import puzzlesReducer from "./puzzles";
import dictionaryReducer from "./dictionary";
import usersReducer from "./users";
import uiReducer from "./ui";

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer({
	history = createBrowserHistory(),
} = {}) {
	return combineReducers({
		router: connectRouter(history),
		users: usersReducer,
		ui: uiReducer,
		dictionary: dictionaryReducer,
		puzzles: puzzlesReducer,
	});
}
