import React from "react";
import { fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";
import { MemoryRouter } from "react-router";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";

import { LOGOUT, LOGIN } from "@app/actions";
import { renderComponent, mount, mockStore } from "@app/utils/test-utils";

import AccountDialog from "./AccountDialog";

const locationProp = Object.getOwnPropertyDescriptor(document, "location");
let locationAssign;

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

beforeEach(() => {
	locationAssign = jest.fn();
	locationAssign.mockName("assign");

	Object.defineProperty(document, "location", {
		assign: locationAssign,
	});
});

afterAll(() => {
	Object.defineProperty(window, "location", locationProp);
});

describe("AccountDialog container", () => {
	fit("should pass the logged in user if user is logged in", () => {
		const user = fromJS({
			id: "1",
			isMe: true,
			provider: "facebook",
		});

		const store = mockStore(fromJS({
			users: {
				currentID: user.get("id"),
				items: {
					[user.get("id")]: user,
				},
			},
		}));

		const component = renderComponent(<AccountDialog />, { store, });

		expect(component.toJSON()).toMatchSnapshot();
	});

	it("should pass undefined for the logged in user if user is not logged in", () => {
		const store = mockStore(fromJS({
			users: {
			},
		}));

		const component = renderComponent(<AccountDialog />, { store, });

		expect(component.toJSON()).toMatchSnapshot();
	});

	it("should dispatch a logout action", () => {
		const user = fromJS({
			id: "1",
			isMe: true,
			provider: "facebook",
		});

		const store = mockStore(fromJS({
			users: {
				currentID: user.get("id"),
				items: {
					[user.get("id")]: user,
				},
			},
		}));

		store.dispatch = jest.fn();

		const wrapper = mount(
			(
				<MemoryRouter>
					<AccountDialog
					/>
				</MemoryRouter>
			),
			{
				store,
			},
		);

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		logoutButton.simulate("click");

		expect(locationAssign).toHaveBeenCalledWith("/auth/logout?redirectTo=blank");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGOUT,
		});
	});

	it("should dispatch a login action", () => {
		const store = mockStore(fromJS({
			users: {
				items: {},
			},
		}));

		store.dispatch = jest.fn();

		const wrapper = mount(
			(
				<MemoryRouter>
					<AccountDialog
						enabledProviders={[ "facebook" ]}
					/>
				</MemoryRouter>
			),
			{
				store,
			},
		);

		const classes = wrapper.find("AccountDialog").prop("classes");

		const loginButton = wrapper.find(`IconButton.${classes.loginLink}`).first();

		loginButton.simulate("click");

		expect(locationAssign).toHaveBeenCalledWith("/auth/facebook?redirectTo=blank");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGIN,
		});
	});
});
