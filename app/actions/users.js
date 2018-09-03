import {
	Set,
}                      from "immutable";
import { getUsers as getUsersFromAPI }    from "@app/api/user";

export const GET_USERS = "@XWORD/USERS/GET";

export function getUsers({ userIDs }) {
	return (dispatch, getState) => {
		userIDs = Set.of(...userIDs);
		if (userIDs.size === 0) {
			// Nothing requested, nothing to do
			return;
		}

		const missingUsers = userIDs.subtract(Set.fromKeys(getState().get("users").items));

		if (missingUsers.size === 0) {
			// Have the users; no need to fetch any
			return;
		}

		return dispatch({
			type: GET_USERS,
			payload: getUsersFromAPI({
				userIDs: userIDs.toArray()
			}),
		});
	};
}

export const UPDATE_USER_PROFILE = "@XWORD/USERS/UPDATE";

export function updateUserProfile({ user }) {
	return {
		type: UPDATE_USER_PROFILE,
		payload: {
			user
		},
	};
}

export const CHANGE_USER_PROFILE = "@XWORD/USERS/CHANGE";

export function changeUserProfile({ userID, updates }) {
	return {
		type: CHANGE_USER_PROFILE,
		payload: {
			userID,
			updates
		},
	};
}
