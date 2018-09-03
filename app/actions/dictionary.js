export const FIND_TERMS = "@XWORD/TERMS/FIND";

export function findTerms(searchArgs) {
	return {
		type: FIND_TERMS,
		payload: searchArgs
	};
	// return (dispatch, getState) => {
	// 	const state = getState();

	// 	if (!state.getIn(["dictionary", "termSearches", searchArgs.pattern])) {
	// 		dispatch({
	// 			type: FIND_TERMS,
	// 			payload: DictionaryUtils.findTerms(searchArgs).then(
	// 				(results) => Map({
	// 					results,
	// 					searchArgs: fromJS(searchArgs),
	// 				})
	// 			),
	// 		});
	// 	}
	// };
}
