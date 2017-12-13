import { connect }      from "react-redux";
import DictionaryLookup from "project/scripts/components/DictionaryLookup";
import {
	setUIState,
	findTerms,
}                       from "project/scripts/redux/actions";

const DictionaryLookupContainer = connect(
	function mapStateToProps(state) {
		const uiState = state.get("ui");

		const pattern = uiState.getIn(["DictionaryLookup", "pattern"]);

		return {
			pattern,
			findResults: state.getIn(["dictionary", "findResults"]),
		};
	},

	function mapDispatchToProps(dispatch) {
		return {
			onPatternChange({ pattern }) {
				dispatch(setUIState({
					section: "DictionaryLookup",
					settings: {
						pattern,
					},
				}));
			},

			onSearch(searchArgs) {
				dispatch(findTerms(searchArgs));
			}
		};
	}
)(DictionaryLookup);

DictionaryLookupContainer.displayName = "DictionaryLookupContainer";

export default DictionaryLookupContainer;
