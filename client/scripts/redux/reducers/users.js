import UsersStateRecord from "project/scripts/records/state/users";
import {
	GET_USERS,
	UPDATE_USER_PROFILE,
}                       from "project/scripts/redux/actions";

export default function usersReducer(state = new UsersStateRecord(), action) {
	switch (action.type) {
		case GET_USERS: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.updateUsers(action.payload);
		}

		case UPDATE_USER_PROFILE: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.updateUsers([action.payload.user]);
		}

		default:
			return state;
	}
}
