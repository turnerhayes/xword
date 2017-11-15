import axios      from "axios";
import {
	fromJS
}                 from "immutable";
import UserRecord from "project/scripts/records/user";

class UserUtils {
	static getUser({ userID }) {
		return axios.get(`/api/users/${userID}`).then(
			user => new UserRecord(fromJS(user))
		);
	}

	static getUsers({ userIDs }) {
		return axios.get(
			`/api/users`,
			{
				data: {
					ids: userIDs.join(",")
				}
			}
		);
	}

	static updateProfile({ userID, updates }) {
		return axios.patch(
			`/api/users/${userID}`,
			{
				data: updates
			}
		).then(
			updatedUser => new UserRecord(fromJS(updatedUser))
		);
	}
}

export default UserUtils;
