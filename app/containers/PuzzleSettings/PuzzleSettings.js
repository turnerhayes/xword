import { Map }           from "immutable";
import { connect }       from "react-redux";
import PropTypes         from "prop-types";
import PuzzleSettings    from "@app/components/PuzzleSettings";
import { setUIState }    from "@app/actions";
import { ERROR_OPTIONS } from "@app/constants";

const PuzzleSettingsContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};

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

PuzzleSettingsContainer.propTypes = {
	uiSection: PropTypes.string.isRequired,
};

PuzzleSettingsContainer.displayName = "PuzzleSettingsContainer";

export default PuzzleSettingsContainer;
