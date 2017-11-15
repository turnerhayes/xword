import {
	fromJS
}                    from "immutable";
import {
	REHYDRATE
}                    from "redux-persist/constants";
import UIStateRecord from "project/scripts/records/state/ui";
import {
	SET_UI_STATE
}                    from "project/scripts/redux/actions";

export default function uiStateReducer(state = new UIStateRecord(), action) {
	switch (action.type) {
		case SET_UI_STATE: {
			const { section, settings } = action.payload;

			return state.mergeDeepIn([section], fromJS(settings));
		}

		case REHYDRATE: {
			return state.merge(action.payload.ui).set("isRehydrated", true);
		}

		default:
			return state;
	}
}
