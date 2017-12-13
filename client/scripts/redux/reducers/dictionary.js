import { Map, List } from "immutable";
import {
	FIND_TERMS
}              from "project/scripts/redux/actions";

export default function dictionaryReducer(state = Map(), action) {
	switch (action.type) {
		case FIND_TERMS: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.set("findResults", action.payload || List());
		}

		default: return state;
	}
}
