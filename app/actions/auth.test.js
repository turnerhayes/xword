import { isFSA } from "flux-standard-action";

import {
	login,
	logout,
	LOGIN,
	LOGOUT,
} from "./auth";

describe("auth action creators", () => {
	describe("login", () => {
		it("should throw on a bad provider", () => {
			const provider = "imnotreal";

			expect(
				() => login({ provider })
			).toThrow(`Unrecognized login provider "${provider}"`);
		});

		it("should change document.location and return a LOGIN action", () => {
			jest.spyOn(document.location, "assign").mockImplementation(() => {});

			[
				"facebook",
				"twitter",
				"google",
			].forEach(
				(provider) => {
					const action = login({ provider });

					expect(document.location.assign).toHaveBeenCalledWith(`/auth/${provider}?redirectTo=blank`);
					
					expect(isFSA(action)).toBeTruthy();

					expect(action).toEqual({
						type: LOGIN,
					});
				}
			);
		});
	});

	describe("logout", () => {
		it("should change document.location and return a LOGOUT action", () => {
			jest.spyOn(document.location, "assign").mockImplementation(() => {});

			const action = logout();

			expect(document.location.assign).toHaveBeenCalledWith(`/auth/logout?redirectTo=blank`);
			
			expect(isFSA(action)).toBeTruthy();

			expect(action).toEqual({
				type: LOGOUT,
			});
		});
	});
});
