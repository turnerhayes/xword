import invariant from "invariant";

/**
 * Validate the shape of redux store
 */
export default function checkStore(store) {
	invariant(
		store,
		"(@app/utils/checkStore) injectors: Expected a store object"
	);
	
	invariant(
		typeof store.dispatch === "function",
		"(@app/utils/checkStore) injectors: Expected a dispatch function"
	);

	invariant(
		typeof store.subscribe === "function",
		"(@app/utils/checkStore) injectors: Expected a subscribe function"
	);

	invariant(
		typeof store.getState === "function",
		"(@app/utils/checkStore) injectors: Expected a getState function"
	);

	invariant(
		typeof store.replaceReducer === "function",
		"(@app/utils/checkStore) injectors: Expected a replaceReducer function"
	);

	invariant(
		typeof store.runSaga === "function",
		"(@app/utils/checkStore) injectors: Expected a runSaga function"
	);
}
