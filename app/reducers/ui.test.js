import {
	setUIState,
} from "@app/actions";

import reducer from "./ui";

describe("ui reducer", () => {
	it("SET_UI_STATE", () => {
		const section1Name = "TestSection";

		const setting1Name = "testSetting";

		let setting1Value = "foo";

		let state = reducer(undefined, setUIState({
			section: section1Name,
			settings: {
				[setting1Name]: setting1Value,
			},
		}));

		expect(state.getIn([ section1Name, setting1Name ])).toBe(setting1Value);

		const setting2Name = "testSetting2";

		const setting2Value = "bar";

		setting1Value = "baz";

		state = reducer(state, setUIState({
			section: section1Name,
			settings: {
				[setting1Name]: setting1Value,
				[setting2Name]: setting2Value,
			},
		}));

		expect(state.getIn([ section1Name, setting1Name ])).toBe(setting1Value);
		expect(state.getIn([ section1Name, setting2Name ])).toBe(setting2Value);

		const section2Name = "TestSection2";

		const setting3Name = "testSetting3";

		const setting3Value = "yummy";

		state = reducer(state, setUIState({
			section: section2Name,
			settings: {
				[setting3Name]: setting3Value,
			},
		}));

		expect(state.getIn([ section1Name, setting1Name ])).toBe(setting1Value);
		expect(state.getIn([ section1Name, setting2Name ])).toBe(setting2Value);
		expect(state.getIn([ section2Name, setting3Name ])).toBe(setting3Value);
	});
});
