import { Map }           from "immutable";
import { connect }       from "react-redux";
import PuzzleSettings    from "project/scripts/components/PuzzleSettings";
import { setUIState }    from "project/scripts/redux/actions";
import { ERROR_OPTIONS } from "project/scripts/constants";

export default connect(
	function mapStateToProps(state, ownProps) {
		const props = {};

		if (!ownProps.uiSection) {
			throw new Error("uiSection prop is required");
		} 

		let uiState = state.get("ui");

		if (uiState && uiState.isRehydrated) {
			uiState = uiState.get(ownProps.uiSection);
		}

		uiState = uiState || Map();

		props.currentFontSizeAdjust = uiState.get("fontAdjust");
		props.errorOption = uiState.get("errorOption") || ERROR_OPTIONS.Hide;

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		return {
			onFontSizeAdjustChange(fontAdjust) {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: { fontAdjust },
				}));
			},

			onErrorOptionChange({ errorOption }) {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: { errorOption },
				}));
			},
		};
	}
)(PuzzleSettings);
