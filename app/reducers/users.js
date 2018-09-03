import { Map, fromJS } from "immutable";
import {
	UPDATE_USER_PROFILE,
}              from "@app/actions";

export default function usersReducer(state = Map(), action) {
	switch (action.type) {
		case UPDATE_USER_PROFILE: {
			const user = fromJS(action.payload.user);

			return state.mergeDeepIn(
				["items", user.get("id")],
				user
			);
		}

		default: return state;
	}
}
