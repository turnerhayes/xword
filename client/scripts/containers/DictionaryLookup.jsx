import { connect }      from "react-redux";
import DictionaryLookup from "project/scripts/components/DictionaryLookup";
import {
	setUIState,
	findTerms,
}                       from "project/scripts/redux/actions";

const DictionaryLookupContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};
		const uiState = state.getIn(["ui", ownProps.uiSection, "DictionaryLookup"]);

		if (uiState) {
			props.pattern = uiState.get("pattern");
			props.selectedResult = uiState.get("selectedResult");
			if (props.selectedResult) {
				props.customClue = uiState.get("customClue");
			}
			props.termSearch = state.getIn(["dictionary", "termSearches", props.pattern]);
		}

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		function setUI(settings) {
			return setUIState({
				section: ownProps.uiSection,
				settings: {
					DictionaryLookup: settings,
				},
			});
		}

		return {
			onPatternChange({ pattern }) {
				dispatch(setUI({
					pattern,
				}));
			},

			onSearch(searchArgs) {
				dispatch(findTerms(searchArgs));
			},

			onTermClicked({ result }) {
				const settings = {
					selectedResult: result,
				};

				if (!result) {
					settings.customClue = "";
				}

				dispatch(setUI(settings));
			},

			onCustomClueChange({ clue }) {
				dispatch(setUI({
					customClue: clue,
				}));
			},
		};
	}
)(DictionaryLookup);

DictionaryLookupContainer.displayName = "DictionaryLookupContainer";

export default DictionaryLookupContainer;
