import { Record } from "immutable";

const schema = {
	userID: null,
	isAnonymous: true,
	isMe: false,
	color: ""
};

class PlayerRecord extends Record(schema, "Player") {
	constructor(args) {
		if (args.user && !args.userID) {
			args.userID = args.user.id;
			delete args.user;
		}

		super(args);
	}
}

export default PlayerRecord;
