/**
 * Test store addons
 */

import { browserHistory } from "react-router-dom";
import configureStore from "./configure-store";

describe("configureStore", () => {
	let store;

	beforeAll(() => {
		store = configureStore({}, browserHistory).store;
	});

	describe("runSaga", () => {
		it("should contain a hook for `sagaMiddleware.run`", () => {
			expect(typeof store.runSaga).toBe("function");
		});
	});
});

describe("configureStore params", () => {
	it("should call window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__", () => {
		/* eslint-disable no-underscore-dangle */
		const compose = jest.fn();
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = () => compose;
		configureStore(undefined, browserHistory);
		expect(compose).toHaveBeenCalled();
		/* eslint-enable */
	});
});
