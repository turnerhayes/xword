import { openDB } from "idb";
// import { fromJS } from "immutable";

const DB_VERSION = 1;
const DB_STORE_NAME = "state";

const dbOpenPromise = openDB("xwords", DB_VERSION, {
	upgrade(db, oldVersion, newVersion) {
		switch (newVersion) {
			case DB_VERSION: {
				db.createObjectStore(DB_STORE_NAME);
				break;
			}
			default:
				break;
		}
	},

	blocked() {
		throw new Error("Cannot open database");
	},
});

const updateState = async (store) => {
	const db = await dbOpenPromise;
	const state = store.getState();
	const tx = db.transaction(DB_STORE_NAME, "readwrite");
	const dbStore = tx.store;
	const promises = [];
	state.forEach((value, key) => {
		value = value.toJSON();
		promises.push(dbStore.put(value, key));
	});
	await Promise.all([
		...promises,
		tx.done,
	]);
};
/* 
const loadState = async () => {
	const db = await dbOpenPromise;
	const values = {};
	for (const key of db.getAllKeys()) {
		const value = await db.get(DB_STORE_NAME, key);
		values[key] = fromJS(value);
	}
	return values;
};
*/

export const persistenceMiddleware = (store) => (next) => (action) => {
	const result = next(action);
	try {
		updateState(store);
	}
	catch (ex) {
		// eslint-disable-next-line no-console
		console.error("Error updating persisted store:", ex);
	}
	return result;
};
