import { Record, Map, Set } from "immutable";
import UserRecord           from "project/scripts/records/user";

const schema = {
	items: Map(),
	currentID: null,
	subscriptions: Set(),
	isChangingSubscription: false
};

class UsersStateRecord extends Record(schema, "UsersState") {
	get currentUser() {
		return this.getIn(["items", this.currentID]);
	}
}

UsersStateRecord.prototype.updateUsers = function updateUsers(users) {
	if (!Array.isArray(users)) {
		users = [users];
	}
	
	return this.mergeIn(
		["items"],
		Map(
			users.map(
				(user) => [user.id, new UserRecord(user)]
			)
		)
	);
};

export default UsersStateRecord;
