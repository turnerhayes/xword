import React from "react";
import { fromJS } from "immutable";

import createReducer from "@app/reducers";
import { mockStore, mount } from "@app/utils/test-utils";
import TopNavigationComponent from "@app/components/TopNavigation";

import TopNavigation from "./TopNavigation";

describe("TopNavigation container unit tests", () => {
	it("should pass the correct props", () => {
		const reducer = createReducer();

		let state = reducer(undefined, {});

		let store = mockStore(state);

		let wrapper = mount(
			(
				<TopNavigation />
			),
			{
				store,
			},
		);

		expect(wrapper.find(TopNavigationComponent)).toHaveProp("loggedInUser", undefined);

		const user = fromJS({
			id: "1",
			name: {
				first: "Test",
				last: "Testerson",
				display: "Testy Testerson",
			},
		});

		state = reducer(undefined, {}).mergeDeep(fromJS({
			users: {
				currentID: "1",
				items: {
					1: user,
				},
			},
		}));

		store = mockStore(state);

		wrapper = mount(
			(
				<TopNavigation
				/>
			),
			{
				store,
			},
		);

		expect(wrapper.find(TopNavigationComponent)).toHaveProp("loggedInUser", user);
	});
});
