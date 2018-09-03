describe("store", () => {
	it("should initialize without a current user if none is in the body context", () => {
		// Module caches store instance so this prevents other tests from returning early
		// with the cached instance
		jest.resetModules();
		
		return import("./store").then(
			(module) => {
				const getStore = module.default;
				const store = getStore();

				expect(store.getState().getIn([ "users", "currentID" ])).toBe(null);
			}
		);
	});

	it("should initialize with a current user if a user is in the body context", () => {
		const id = "12345abc";

		document.body.dataset.context = JSON.stringify({
			user: {
				name: {
					display: "Test Tester",
					last: "Tester",
					first: "Test"
				},
				profilePhotoURL: null,
				username: "testy",
				email: "tester@example.com",
				provider: "facebook",
				isAnonymous: false,
				id,
				isMe: true
			}
		});

		// Module caches store instance so this prevents other tests from returning early
		// with the cached instance
		jest.resetModules();

		return import("./store").then(
			(module) => {
				const getStore = module.default;
				const store = getStore();

				expect(store.getState().getIn([ "users", "currentID" ])).toBe(id);
			}
		);
	});
});
