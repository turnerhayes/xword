
export const ADD_PUZZLE = "@XWORD/PUZZLES/ADD";

export function addPuzzle({ puzzle, setAsCurrent }) {
	return {
		type: ADD_PUZZLE,
		payload: {
			puzzle,
			setAsCurrent,
		},
	};
}

export const SET_GENERATED_PUZZLE = "@XWORD/PUZZLES/GENERATED/SET";

export function setGeneratedPuzzle({ puzzle }) {
	return {
		type: SET_GENERATED_PUZZLE,
		payload: {
			puzzle
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_CELL = "@XWORD/PUZZLES/GENERATED/UPDATE_CELL";

export function updateGeneratedPuzzleCell({ columnIndex, rowIndex, cell }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_CELL,
		payload: {
			columnIndex,
			rowIndex,
			cell
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_GRID = "@XWORD/PUZZLES/GENERATED/UPDATE_GRID";

export function updateGeneratedPuzzleGrid({ grid }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_GRID,
		payload: {
			grid
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_CLUE = "@XWORD/PUZZLES/GENERATED/UPDATE_CLUE";

export function updateGeneratedPuzzleClue({ clueNumber, clueText, direction }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_CLUE,
		payload: {
			clueNumber,
			clueText,
			direction
		},
	};
}

export const CLEAR_GENERATED_PUZZLE_CLUES = "@XWORD/PUZZLES/GENERATED/CLEAR_CLUES";

export function clearGeneratedPuzzleClues() {
	return {
		type: CLEAR_GENERATED_PUZZLE_CLUES,
	};
}

export const SET_CURRENT_PUZZLE_INDEX = "@XWORD/PUZZLES/SET_CURRENT_INDEX";

export function setCurrentPuzzleIndex({ index }) {
	return {
		type: SET_CURRENT_PUZZLE_INDEX,
		payload: index,
	};
}

export const SET_PUZZLE_CELL_CONTENT = "@XWORD/PUZZLES/SET_CELL_CONTENT";

export function setPuzzleCellContent({ puzzleIndex, position, value }) {
	return {
		type: SET_PUZZLE_CELL_CONTENT,
		payload: {
			puzzleIndex,
			position,
			value,
		},
	};
}
