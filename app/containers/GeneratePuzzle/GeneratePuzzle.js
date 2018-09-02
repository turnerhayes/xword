import { connect }    from "react-redux";
import GeneratePuzzle from "@app/components/GeneratePuzzle";
import {
	setUIState,
	setGeneratedPuzzle,
	updateGeneratedPuzzleCell,
	updateGeneratedPuzzleGrid,
	updateGeneratedPuzzleClue,
	clearGeneratedPuzzleClues
}                     from "@app/actions";
import {
	DIRECTIONS
}                     from "@app/constants";


export default connect(
	function mapStateToProps(state, ownProps) {
		const props = {};


		const puzzlesState = state.get("puzzles");

		if (puzzlesState.get("isRehydrated")) {
			if (puzzlesState.get("generatedPuzzle")) {
				props.puzzle = puzzlesState.get("generatedPuzzle");
				props.height = props.puzzle.get("grid").size;
				props.width = props.puzzle.get("grid").first().size;
			}
		}

		const uiState = state.get("ui");

		props.isRehydrating = !uiState.get("isRehydrated");

		if (uiState && uiState.get("isRehydrated")) {
			const uiSection = ownProps.uiSection || "GeneratePuzzle";

			props.cellPlacementMode = uiState.getIn([uiSection, "cellPlacementMode"]);
			props.selectedCellPosition = uiState.getIn([uiSection, "selectedCellPosition"]);
			props.currentDirection = uiState.getIn([uiSection, "currentDirection"]);
			props.isDictionaryLookupDialogOpen = uiState.getIn([uiSection, "DictionaryLookupDialog", "isOpen"], false);

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
						width: puzzle.get("grid").first().size,
						height: puzzle.get("grid").size,
					},
				}));
			},

			onChangeSelectedCell({ position, cell, currentDirection }) {
				const settings = {
					selectedCellPosition: position,
				};

				if (position !== null && !currentDirection) {
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

			onToggleDictionaryLookupDialogOpen(state) {
				dispatch(setUIState({
					section: uiSection,
					settings: {
						DictionaryLookup: {
							isOpen: !!state,
						},
					},
				}));
			}
		};
	}
)(GeneratePuzzle);
