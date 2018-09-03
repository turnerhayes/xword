import { fromJS }      from "immutable";
import {
	SET_UI_STATE
}                      from "@app/actions";
import {
	DIRECTIONS,
	CELL_PLACEMENT_MODES
}                      from "@app/constants";

const initialState = {
	SolvePuzzle: {
		fontAdjust: 0,
		selectedCellPosition: null,
		currentDirection: DIRECTIONS.Across,
	},
	GeneratePuzzle: {
		width: null,
		height: null,
		cellPlacementMode: CELL_PLACEMENT_MODES.Input,
		selectedCellPosition: null,
		currentDirection: DIRECTIONS.Across,
	},
	DictionaryLookup: {},
	isRehydrated: true,
};

export default function uiReducer(state = fromJS(initialState), action) {
	switch (action.type) {
		case SET_UI_STATE: {
			const { section, settings } = action.payload;

			return state.mergeIn([section], fromJS(settings));
		}

		default: return state;
	}
}
