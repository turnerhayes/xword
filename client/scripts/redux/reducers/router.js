import { Map } from "immutable";
import {
	LOCATION_CHANGE
} from "react-router-redux";


const initialState = Map([
	["locationBeforeTransitions", null]
]);

export default function routerReducer(state = initialState, action) {
	switch (action.type) {
		case LOCATION_CHANGE: {
			return state.set("locationBeforeTransitions", action.payload);
		}

		default:
			return state;
	}
}
