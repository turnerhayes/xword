import { connect }    from "react-redux";
import GeneratePuzzle from "project/scripts/components/GeneratePuzzle";
import {
	setUIState,
	setGeneratedPuzzle,
	updateGeneratedPuzzleCell,
	updateGeneratedPuzzleGrid,
	updateGeneratedPuzzleClue,
	clearGeneratedPuzzleClues
}                     from "project/scripts/redux/actions";
import {
	DIRECTIONS
}                     from "project/scripts/constants";


export default connect(
	function mapStateToProps(state, ownProps) {
		const props = {};


		const puzzlesState = state.get("puzzles");

		if (puzzlesState.isRehydrated) {
			if (puzzlesState.generatedPuzzle) {
				props.puzzle = puzzlesState.generatedPuzzle;
				props.height = props.puzzle.grid.size;
				props.width = props.puzzle.grid.first().size;
			}
		}

		const uiState = state.get("ui");

		if (uiState && uiState.isRehydrated) {
			const uiSection = ownProps.uiSection || "GeneratePuzzle";

			props.cellPlacementMode = uiState.getIn([uiSection, "cellPlacementMode"]);
			props.selectedCellPosition = uiState.getIn([uiSection, "selectedCellPosition"]);
			props.currentDirection = uiState.getIn([uiSection, "currentDirection"]);

			if (props.selectedCellPosition && !props.currentDirection) {
				props.currentDirection = DIRECTIONS.Across;
			}
		}

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		const uiSection = ownProps.uiSection || "GeneratePuzzle";

		return {
			onSetPuzzle({ puzzle }) {
				dispatch(setGeneratedPuzzle({
					puzzle
				}));
				dispatch(setUIState({
					section: uiSection,
					settings: {
						width: puzzle.grid.first().size,
						height: puzzle.grid.size,
					},
				}));
			},

			onChangeFocusedCell({ position, cell }) {
				const settings = {
					selectedCellPosition: position,
				};

				if (!ownProps.currentDirection) {
					settings.currentDirection = cell.getIn(["containingClues", "across"]) ?
						DIRECTIONS.Across :
						DIRECTIONS.Down;
				}
				dispatch(setUIState({
					section: uiSection,
					settings
				}));
			},

			onCellPlacementModeChange({ mode }) {
				dispatch(setUIState({
					section: uiSection,
					settings: {
						cellPlacementMode: mode,
					},
				}));
			},

			onUpdatePuzzleCell(columnIndex, rowIndex, cell) {
				dispatch(updateGeneratedPuzzleCell({
					columnIndex,
					rowIndex,
					cell,
				}));
			},

			onUpdateGrid(grid) {
				dispatch(updateGeneratedPuzzleGrid({
					grid,
				}));
			},

			onClueChange({ clueNumber, clueText, direction }) {
				dispatch(updateGeneratedPuzzleClue({
					clueNumber,
					clueText,
					direction
				}));
			},

			onClearClues() {
				dispatch(clearGeneratedPuzzleClues());
			},
		};
	}
)(GeneratePuzzle);
