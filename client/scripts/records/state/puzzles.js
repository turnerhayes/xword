import { Record, List } from "immutable";

const schema = {
	currentPuzzleIndex: null,
	puzzles: List(),
	generatedPuzzle: null,
	isRehydrated: false,
};

class PuzzlesStateRecord extends Record(schema, "PuzzlesState") {
	addPuzzle(puzzle) {
		return this.set("currentPuzzleIndex", this.puzzles.size).puzzles.push(puzzle);
	}
}

export default PuzzlesStateRecord;
