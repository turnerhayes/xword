import { fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";

import {
	updateUserProfile,
} from "@app/actions";

import reducer from "./users";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("users reducer", () => {
	it("UPDATE_USER_PROFILE", () => {
		const user = fromJS({
			id: "1",
			name: {
				display: "Tester One",
			},
			isMe: true,
		});

		let state = reducer(
			fromJS({
				items: {
					[user.get("id")]: user,
				},
			}),
			{}
		);

		expect(state.get("items")).toEqualImmutable(fromJS({
			[user.get("id")]: user,
		}));

		const newDisplayName = "Fancy Tester";

		state = reducer(state, updateUserProfile({
			user: user.setIn([ "name", "display" ], newDisplayName).toJS(),
		}));

		expect(state.getIn([ "items", user.get("id"), "name", "display" ])).toBe(newDisplayName);
	});
});
