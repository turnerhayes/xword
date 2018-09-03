import { fromJS } from "immutable";
import fetchMock from "fetch-mock";
import * as immutableMatchers from "jest-immutable-matchers";
import { URLSearchParams } from "url";

import { getUser, getUsers } from "./user";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

afterEach(() => {
	fetchMock.restore();
});

describe("User API", () => {
	describe("getUser", () => {
		it("should return a user object", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/users\/(\w+)/;

			const userID = "123";

			const displayName = "Test Testerson";

			let receivedUserID;

			fetchMock.get(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				receivedUserID = matches[1];

				return {
					id: receivedUserID,
					name: {
						display: displayName,
					},
				};
			});

			const user = await getUser({ userID });

			expect(receivedUserID).toBe(userID);

			expect(user).toEqualImmutable(fromJS({
				id: userID,
				name: {
					display: displayName,
				},
			}));
		});

		it("should reject on error", () => {
			const uriRegex = /\/api\/users\/(\w+)/;

			const error = "Test error";

			fetchMock.get(uriRegex, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const userPromise = getUser({ userID: "123" });

			expect(userPromise).rejects.toThrow(new Error(error));
		});
	});

	describe("getUsers", () => {
		it("should return a list of user objects", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/users\?(.*)/;

			const userIDs = [ "123", "456", "789" ];

			const displayName = "Test Testerson";

			let receivedUserIDs;

			fetchMock.get(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				const params = new URLSearchParams(matches[1]);

				receivedUserIDs = params.get("ids").split(",");

				return receivedUserIDs.map(
					(id) => (
						{
							id,
							name: {
								display: displayName,
							},
						}
					)
				);
			});

			const users = await getUsers({ userIDs });

			expect(receivedUserIDs).toEqual(userIDs);

			expect(users).toEqualImmutable(fromJS(
				userIDs.map((id) => (
					{
						id,
						name: {
							display: displayName,
						},
					}
				))
			));
		});

		it("should reject on error", () => {
			const error = "Test error";

			fetchMock.get(/\/api\/users\?(.*)/, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const usersPromise = getUsers({ userIDs: [ "123", "456", "789" ] });

			expect(usersPromise).rejects.toThrow(new Error(error));
		});
	});
});
