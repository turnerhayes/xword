import { connect } from "react-redux";
import SolvePuzzle from "@app/components/SolvePuzzle";
import {
	setUIState,
	setCurrentPuzzleIndex,
	setPuzzleCellContent,
	addPuzzle
}                  from "@app/actions";
import {
	DIRECTIONS
}                  from "@app/constants";


export default connect(
	function mapStateToProps(state) {
		const props = {};

		const uiState = state.get("ui");

		["selectedCellPosition", "currentDirection"].forEach(
			(prop) => {
				if (uiState.hasIn(["SolvePuzzle", prop])) {
					props[prop] = uiState.getIn(["SolvePuzzle", prop]);
				}
			}
		);

		const puzzlesState = state.get("puzzles");
		props.existingPuzzles = puzzlesState.get("puzzles");
		props.currentPuzzleIndex = puzzlesState.get("currentPuzzleIndex");

		if (props.currentPuzzleIndex !== null) {
			props.puzzle = props.existingPuzzles.get(props.currentPuzzleIndex);
		}

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		const uiSection = ownProps.uiSection || "SolvePuzzle";

		const resetUI = () => {
			dispatch(setUIState({
				section: uiSection,
				settings: {
					currentDirection: null,
					selectedCellPosition: null,
				},
			}));
		};

		return {
			onPuzzleSelected({ index }) {
				dispatch(setCurrentPuzzleIndex({
					index
				}));

				resetUI();
			},

			onInputCellSelect({ cell, position, currentDirection }) {
				const settings = {
					selectedCellPosition: position,
				};

				if (!currentDirection) {
					settings.currentDirection = cell.getIn(["containingClues", "across"]) ?
						DIRECTIONS.Across :
						DIRECTIONS.Down;
				}

				dispatch(setUIState({
					section: uiSection,
					settings
				}));
			},

			setDirection({ direction }) {
				dispatch(setUIState({
					section: uiSection,
					settings: {
						currentDirection: direction,
					}
				}));
			},

			addPuzzle({ puzzle }) {
				dispatch(addPuzzle({
					puzzle,
					setAsCurrent: true,
				}));

				resetUI();
			},

			setPuzzleCellContent({ puzzleIndex, position, value }) {
				dispatch(setPuzzleCellContent({
					puzzleIndex,
					position,
					value
				}));
			},
		};
	}
)(SolvePuzzle);
