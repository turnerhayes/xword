import { isFSA } from "flux-standard-action";

import {
	login,
	logout,
	LOGIN,
	LOGOUT,
} from "./auth";

jest.mock("@app/utils/navigation");

import { navigateToUrl } from "@app/utils/navigation";

describe("auth action creators", () => {
	describe("login", () => {
		it("should throw on a bad provider", () => {
			const provider = "imnotreal";

			expect(
				() => login({ provider })
			).toThrow(`Unrecognized login provider "${provider}"`);
		});

		it("should change document.location and return a LOGIN action", () => {
			[
				"facebook",
				"twitter",
				"google",
			].forEach(
				(provider) => {
					const action = login({ provider });

					expect(navigateToUrl).toHaveBeenCalledWith(`/auth/${provider}?redirectTo=${encodeURIComponent("/")}`);
					
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
			const action = logout();

			expect(navigateToUrl).toHaveBeenCalledWith(`/auth/logout?redirectTo=${encodeURIComponent("/")}`);
			
			expect(isFSA(action)).toBeTruthy();

			expect(action).toEqual({
				type: LOGOUT,
			});
		});
	});
});
