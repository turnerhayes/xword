import { Map, List } from "immutable";
import {
	FIND_TERMS,
}              from "project/scripts/redux/actions";

export default function dictionaryReducer(state = Map(), action) {
	switch (action.type) {
		case FIND_TERMS: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(
				["termSearches", action.payload.getIn(["searchArgs", "pattern"])],
				action.payload.set("results", action.payload.get("results") || List()),
			);
		}

		default: return state;
	}
}
