import { Record, Map } from "immutable";

const schema = {
	id: null,
	username: "",
	isAdmin: false,
	isAnonymous: true,
	isMe: false,
	name: null,
	provider: null
};

/**
 * Record representing a user.
 *
 * @memberof client.records
 * @extends Immutable.Record
 */
class UserRecord extends Record(schema, "User") {
	/**
	 * @param {object} args - the constructor arguments
	 * @param {object|external:Immutable.Map} [args.name] - name of the user
	 * @param {string} [args.name.first] - the user's first name
	 * @param {string} [args.name.middle] - the user's middle name
	 * @param {string} [args.name.last] - the user's last name
	 * @param {string} [args.name.display] - the name to display to other users
	 */
	constructor(args) {
		args.name = Map(args.name);

		super(args);
	}

	/**
	 * @member {string} id - the ID of the user
	 */

	/**
	 * @member {string} username - the username of the user
	 */

	/**
	 * @member {boolean} isAnonymous - whether or not the user has a site account
	 */

	/**
	 * @member {boolean} isAdmin - whether or not the user has administrator privileges
	 */

	/**
	 * @member {boolean} isMe - whether or not the user represents the current user
	 */

	/**
	 * @member {external:Immutable.Map} name - the name of the user
	 *
	 * @prop {string} [first] - the user's first name
	 * @prop {string} [middle] - the user's middle name
	 * @prop {string} [last] - the user's last name
	 * @prop {string} [display] - the user's display name
	 */
}

export default UserRecord;
