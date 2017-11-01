import { Record, Map } from "immutable";

const schema = {
	SolvePuzzle: Map({
		fontAdjust: 0
	}),
};

class UIStateRecord extends Record(schema, "UsersState") {
}

export default UIStateRecord;
