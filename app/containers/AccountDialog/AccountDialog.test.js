import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import { shallow, mount } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";
import { MemoryRouter } from "react-router";
import { intlShape } from "react-intl";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";

import { LOGOUT, LOGIN } from "@app/actions";
import { intl, mockStore } from "@app/utils/test-utils";

import AccountDialog from "./AccountDialog";

beforeAll(async () => {
	jest.addMatchers(immutableMatchers);
});

describe("AccountDialog container", () => {
	it("should pass the logged in user if user is logged in", () => {
		const user = fromJS({
			id: "1",
			isMe: true,
		});

		const store = mockStore(fromJS({
			users: {
				currentID: user.get("id"),
				items: {
					[user.get("id")]: user,
				},
			},
		}));

		const wrapper = shallow(
			(
				<AccountDialog
				/>
			),
			{
				context: {
					intl,
					store,
				},
			}
		);

		expect(wrapper.dive().dive().prop("loggedInUser")).toEqualImmutable(user);
	});

	it("should pass undefined for the logged in user if user is not logged in", () => {
		const store = mockStore(fromJS({
			users: {
			},
		}));

		const wrapper = shallow(
			(
				<AccountDialog
				/>
			),
			{
				context: {
					intl,
					store,
				},
			}
		);

		expect(wrapper.dive().prop("loggedInUser")).toBeUndefined();
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

		jest.spyOn(document.location, "assign").mockImplementation(() => {});

		const wrapper = mount(
			(
				<MemoryRouter>
					<AccountDialog
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store,
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
		);

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		logoutButton.simulate("click");

		expect(document.location.assign).toHaveBeenCalledWith("/auth/logout?redirectTo=blank");

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

		jest.spyOn(document.location, "assign").mockImplementation(() => {});

		const wrapper = mount(
			(
				<MemoryRouter>
					<AccountDialog
						enabledProviders={[ "facebook" ]}
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store,
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
		);

		const classes = wrapper.find("AccountDialog").prop("classes");

		const loginButton = wrapper.find(`IconButton.${classes.loginLink}`).first();

		loginButton.simulate("click");

		expect(document.location.assign).toHaveBeenCalledWith("/auth/facebook?redirectTo=blank");

		expect(store.dispatch).toHaveBeenCalledWith({
			type: LOGIN,
		});
	});
});
