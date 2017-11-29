import UserRecord from "project/scripts/records/user";
import PuzzlesStateRecord from "project/scripts/records/state/puzzles";
import UIStateRecord from "project/scripts/records/state/ui";
import UsersStateRecord from "project/scripts/records/state/users";

const allRecords = [
	UserRecord,
	PuzzlesStateRecord,
	UIStateRecord,
	UsersStateRecord,
];

export default allRecords;
