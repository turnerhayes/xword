import { Map }           from "immutable";
import { connect }       from "react-redux";
import PropTypes         from "prop-types";
import CrosswordGrid     from "project/scripts/components/CrosswordGrid";
import {
	ERROR_OPTIONS,
	DIRECTIONS
}                        from "project/scripts/constants";
import {
	setUIState
}                        from "project/scripts/redux/actions";

const CrosswordGridContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};

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

	function mapDispatchToProps(dispatch, ownProps) {
		return {
			toggleDirection: ownProps.toggleDirection || function toggleDirection({ currentDirection, position }) {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: {
						currentDirection: currentDirection === DIRECTIONS.Across ||
							!ownProps.puzzle.grid.getIn([position[1], position[0], "containingClues", "across"]) ?
								DIRECTIONS.Down :
								DIRECTIONS.Across,
					}
				}));
			},
		};
	}
)(CrosswordGrid);

CrosswordGridContainer.propTypes = {
	uiSection: PropTypes.string.isRequired,
};

CrosswordGridContainer.displayName = "CrosswordGridContainer";

export default CrosswordGridContainer;
