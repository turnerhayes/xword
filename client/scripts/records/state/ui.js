import { Record, Map } from "immutable";
import {
	CELL_PLACEMENT_MODES,
	DIRECTIONS
}                      from "project/scripts/constants";

const schema = {
	SolvePuzzle: Map({
		fontAdjust: 0,
		selectedCellPosition: null,
		currentDirection: DIRECTIONS.Across,
	}),
	GeneratePuzzle: Map({
		width: null,
		height: null,
		cellPlacementMode: CELL_PLACEMENT_MODES.Input,
		selectedCellPosition: null,
		currentDirection: DIRECTIONS.Across,
	}),
	DictionaryLookup: Map(),
	isRehydrated: false,
};

class UIStateRecord extends Record(schema, "UIState") {}

export default UIStateRecord;
