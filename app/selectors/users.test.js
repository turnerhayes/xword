/* eslint-env jest */

import { fromJS, Set } from "immutable";
import userSelectors from "./users";
import * as immutableMatchers from "jest-immutable-matchers";

describe("users selector", () => {
	beforeEach(() => jest.addMatchers(immutableMatchers));

	const userID = "my-user-id";

	const user = fromJS({
		id: userID,
		name: {
			first: "Testy",
			last: "Testerson",
			display: "Testmaster Flash",
		}
	});

	const initialState = fromJS({
		items: {
			[userID]: user,
			"other-user": {
				id: "other-user",
				name: {
					first: "Other",
					last: "User",
					display: "Other User",
				},
			},
		},
		currentID: null,
	});

	describe("getLoggedInUser", () => {
		it("should return nothing when no user is logged in", () => {
			const loggedInUser = userSelectors.getLoggedInUser(initialState);

			expect(loggedInUser).toBeUndefined();
		});

		it("should return the user when user is logged in", () => {
			const loggedInUser = userSelectors.getLoggedInUser(
				initialState.set("currentID", userID)
			);

			expect(loggedInUser).toEqualImmutable(user);
		});
	});

	describe("getCurrentUser", () => {
		it("should return nothing when there is no current user", () => {
			const currentUser = userSelectors.getCurrentUser(initialState);

			expect(currentUser).toBeUndefined();
		});

		it("should return the user when it is current user", () => {
			const modifiedUser = user.set("isMe", true);
			const currentUser = userSelectors.getCurrentUser(
				initialState.setIn(["items", userID], modifiedUser)
			);

			expect(currentUser).toEqualImmutable(modifiedUser);
		});

		it("should return the logged in user when there is one", () => {
			const modifiedUser = user.set("isMe", true);
			const state = initialState.setIn(["items", userID], modifiedUser)
				.set("currentID", userID);
			const currentUser = userSelectors.getCurrentUser(state);
			const loggedInUser = userSelectors.getLoggedInUser(state);

			expect(currentUser).toEqualImmutable(loggedInUser);
		});
	});

	describe("filterUsers", () => {
		const users = {};

		const NUMBER_OF_USERS = 10;

		for (let i = 0; i <= NUMBER_OF_USERS; i++) {
			users["" + i] = {
				id: i + "",
				name: `Test User ${i}`,
			};
		}

		const state = fromJS({
			items: users,
			currentID: null,
		});

		it("should return all users if no user IDs are passed", () => {
			const result = userSelectors.filterUsers(state);

			expect(result).toEqualImmutable(fromJS(users));
		});

		it("should return an empty Map if an empty set of user IDs are passed", () => {
			const result = userSelectors.filterUsers(state, { userIDs: Set() });

			expect(result).toEqualImmutable(fromJS({}));
		});

		it("should return a subset of users if user IDs are passed", () => {
			const result = userSelectors.filterUsers(
				state,
				{
					userIDs: Set([ "2", "4", "6" ]),
				}
			);

			expect(result).toEqualImmutable(fromJS({
				2: users["2"],
				4: users["4"],
				6: users["6"],
			}));
		});
	});
});
