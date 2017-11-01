import {
	List,
	fromJS
}                         from "immutable";
import {
	ImmutablePuzzle
}                         from "xpuz";
import PuzzlesStateRecord from "project/scripts/records/state/puzzles";
import {
	REHYDRATE
}                         from "redux-persist/constants";
import {
	ADD_PUZZLE,
	SET_CURRENT_PUZZLE_INDEX,
	SET_PUZZLE_CELL_CONTENT,
	UPDATE_GENERATED_PUZZLE_CELL,
	UPDATE_GENERATED_PUZZLE_GRID
}                         from "project/scripts/redux/actions";

export default function puzzlesReducer(state = new PuzzlesStateRecord(), action) {
	switch (action.type) {
		case ADD_PUZZLE: {
			state = state.updateIn(["puzzles"], (puzzles) => puzzles.push(action.payload.puzzle));

			if (action.payload.setAsCurrent) {
				state = state.set("currentPuzzleIndex", state.puzzles.size - 1);
			}

			return state;
		}

		case SET_CURRENT_PUZZLE_INDEX: {
			return state.set("currentPuzzleIndex", action.payload);
		}

		case SET_PUZZLE_CELL_CONTENT: {
			let puzzle = state.puzzles.get(action.payload.puzzleIndex);

			if (!puzzle) {
				return state;
			}

			const { position, value } = action.payload;
			return state.setIn(["puzzles", action.payload.puzzleIndex, "userSolution", position[1], position[0]], fromJS(value));
		}

		case UPDATE_GENERATED_PUZZLE_CELL: {
			if (!state.get("generatedPuzzle")) {
				return state;
			}

			const { columnIndex, rowIndex, cell } = action.payload;

			return state.update("generatedPuzzle", (puzzle) => puzzle.updateCell(columnIndex, rowIndex, cell));
		}

		case UPDATE_GENERATED_PUZZLE_GRID: {
			if (!state.get("generatedPuzzle")) {
				return state;
			}

			const { grid } = action.payload;

			return state.update("generatedPuzzle", (puzzle) => puzzle.updateGrid(grid));
		}

		case REHYDRATE: {
			let incoming = action.payload.puzzles;

			if (incoming) {
				if (incoming.get("puzzles")) {
					incoming = incoming.setIn(["puzzles"], List(incoming.get("puzzles").map(puzzle => new ImmutablePuzzle(puzzle.toJS()))));
				}

				if (incoming.get("generatedPuzzle")) {
					incoming = incoming.set("generatedPuzzle", new ImmutablePuzzle(incoming.get("generatedPuzzle").toJS()));
				}

				state = state.mergeDeep(incoming);
			}

			return state.set("isRehydrated", true);
		}

		default:
			return state;
	}
}
