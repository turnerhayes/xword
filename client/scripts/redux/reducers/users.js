import { Set }          from "immutable";
import UsersStateRecord from "project/scripts/records/state/users";
import {
	GET_GAME,
	GET_USER_GAMES,
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

		case GET_GAME: {
			if (action.error) {
				return state;
			}

			const users = action.payload.players.map(
				(player) => {
					return player.user;
				}
			);

			if (users.length === 0) {
				return state;
			}

			return state.updateUsers(users);
		}

		case GET_USER_GAMES: {
			if (action.error) {
				return state;
			}

			let users = Set();

			action.payload.forEach(
				(game) => {
					users = users.concat(...game.players.map(
						(player) => player.user
					));
				}
			);

			if (users.size === 0) {
				return state;
			}

			return state.updateUsers(users.toArray());
		}

		default:
			return state;
	}
}
