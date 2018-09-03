import { createSelector } from "reselect";

/**
 * Converts a path array to a selector function if necessary.
 *
 * @param {array|function} sliceSelector - the value to coerce to a selector function
 * @param {*} defaultValue - the default value to use for the `getIn()` call, if
 *	applicable
 *
 * @returns {function} a slice selector function
 */
function coerceToSliceSelector(sliceSelector, defaultValue) {
	if (Array.isArray(sliceSelector)) {
		const path = sliceSelector;
		sliceSelector = (state) => state.getIn(path, defaultValue);
	}

	return sliceSelector;
}

/**
 * Wraps a selector so that it operates on a slice of the state passed to it
 * rather than the whole state.
 *
 * For example, there may be a selector that operates on just a game Map.
 * But when called by `mapStateToProps` in a container, it will generally be passed
 * the entire Redux store state, not just the state of a single game. The game selector
 * _could_ operate on the entire state (i.e. look in
 * `state.getIn(["games", "items", "myGameName", "someKey"])` in order to get the value of
 * `someKey`), but there are a few drawbacks to this approach:
 *	- harder to unit test on their own--unit tests for game selectors would have to construct
 *		an entire state tree, when it really only ever interacts with a specified game structure
 *	- will recalculate its value whenever some part of the state changes (even if it doesn't
 *		actually affect the result of the selector)--this is because the reselect memoizer function
 *		will notice that the full states are not identical (since something has changed)
 *	- more fragile--if we change the structure above the inidividual game level, we will need to
 *		change every `getIn()` path to match
 *	- less flexible--if we want to select into an arbitrary game map (one not necessarily in the
 *		state), we'd need to construct an entire state tree (see first point above)
 *
 * To that end, this utility function takes each selector and wraps it in another selector that
 * will get some slice and invoke the actual selector, passing it that slice (and any props).
 *
 * @param {object} args - the arguments
 * @param {function} args.selector - the selectors to wrap
 * @param {string} [args.selectorName=selector.name] - the name of the selector; used to construct a name
 *	that can be useful for debugging
 * @param {array|function} args.sliceSelector - either selector that returns
 *	the slice of the state that the wrapper selectors should pass, or an array
 *	representing a path for a `getIn()` call that will return the appropriate
 *	slice of state
 * @param {*} [args.defaultValue] - if `sliceSelector` is a path array, this is
 *	the value that should be used if the `getIn()` doesn't return anything
 *
 * @returns {function} - the wrapped selector
 */
export function wrapSelector({
	selector,
	selectorName = selector.name,
	sliceSelector,
	defaultValue,
}) {
	sliceSelector = coerceToSliceSelector(sliceSelector, defaultValue);

	const wrappedSelector = createSelector(
		sliceSelector,
		(state, props) => props,
		(stateSlice, props) => stateSlice && selector(stateSlice, props)
	);

	if (selectorName) {
		// Set display name for easier debugging
		Object.defineProperty(
			wrappedSelector,
			"name",
			{
				value: `${selectorName}_wrapped`,
				configurable: true,
			}
		);
	}

	return wrappedSelector;
}

/**
 * Convience method to wrap an object of selectors using {@link wrapSelector}.
 *
 * @param {object} args - the arguments
 * @param {object<string, function>} args.selectors - the selectors to wrap
 * @param {array|function} args.sliceSelector - the slice selector to use in the wrapper
 * @param {*} [args.defaultValue] - the defaultValue to use in the wrapper
 *
 * @returns {object<string, function>} an object containing the wrapped selectors (keys
 *	are the same as the `selectors` parameter's own enumerable properties)
 */
export function wrapSelectors({
	selectors,
	sliceSelector,
	defaultValue
}) {
	// Use a single slice selector for all wrapped selectors
	sliceSelector = coerceToSliceSelector(sliceSelector, defaultValue);

	return Object.keys(selectors).reduce(
		(wrappedSelectors, selectorKey) => {
			wrappedSelectors[selectorKey] = wrapSelector({
				selector: selectors[selectorKey],
				selectorName: selectorKey,
				sliceSelector,
			});

			return wrappedSelectors;
		},
		{}
	);
}
