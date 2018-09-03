import { Map }           from "immutable";
import { connect }       from "react-redux";
import PropTypes         from "prop-types";
import CrosswordGrid     from "@app/components/CrosswordGrid";
import {
	ERROR_OPTIONS,
	DIRECTIONS
}                        from "@app/constants";
import {
	setUIState
}                        from "@app/actions";

const CrosswordGridContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};

		let uiState = state.get("ui");

		if (uiState && uiState.get("isRehydrated")) {
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
			toggleDirection: ownProps.toggleDirection === undefined ?
				function toggleDirection({ currentDirection, position }) {
					dispatch(setUIState({
						section: ownProps.uiSection,
						settings: {
							currentDirection: currentDirection === DIRECTIONS.Across ||
								!ownProps.puzzle.grid.getIn([position.get(1), position.get(0), "containingClues", "across"]) ?
								DIRECTIONS.Down :
								DIRECTIONS.Across,
						},
					}));
				} :
				ownProps.toggleDirection,

			onMoveFocus: ownProps.onMoveFocus === undefined ?
				function onMoveFocus({ nextPosition }) {
					if (nextPosition) {
						dispatch(setUIState({
							section: ownProps.uiSection,
							settings: {
								selectedCellPosition: nextPosition,
							},
						}));
					}
				} :
				ownProps.onMoveFocus,
		};
	}
)(CrosswordGrid);

CrosswordGridContainer.propTypes = {
	uiSection: PropTypes.string.isRequired,
};

CrosswordGridContainer.displayName = "CrosswordGridContainer";

export default CrosswordGridContainer;
