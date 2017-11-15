import { Map }           from "immutable";
import { connect }       from "react-redux";
import CrosswordGrid     from "project/scripts/components/CrosswordGrid";
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

		props.fontAdjust = uiState.get("fontAdjust");
		props.selectedCellPosition = uiState.get("selectedCellPosition");
		props.currentDirection = uiState.get("currentDirection");
		props.errorOption = uiState.get("errorOption") || ERROR_OPTIONS.Hide;

		return props;
	},

	function mapDispatchToProps(/*dispatch, ownProps*/) {
		return {
		};
	}
)(CrosswordGrid);
