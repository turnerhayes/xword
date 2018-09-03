import React from "react";
import { fromJS } from "immutable";
import { shallow } from "enzyme";
import { Link } from "react-router-dom";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CardHeader from "@material-ui/core/CardHeader";
import { Unwrapped as AccountDialog } from "./AccountDialog";
import { intl } from "@app/utils/test-utils";

const NO_OP = () => {};

describe("AccountDialog component", () => {
	const loginLinkClass = "login-link";

	it("should show a login link for each supported provider if no user is logged in", () => {
		const providers = [ "facebook", "google", "twitter" ];


		const wrapper = shallow(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				enabledProviders={providers}
				intl={intl}
				classes={{
					loginLink: loginLinkClass,
				}}
			/>
		);

		const loginButtons = wrapper.find(IconButton).filter(`.${loginLinkClass}`);

		expect(loginButtons).toHaveLength(providers.length);
		providers.forEach(
			(provider) => expect(
				loginButtons.filterWhere(
					(el) => el.key() === provider
				)
			).toExist()
		);
	});

	it("should not show a login link for a provider if that provider is not supported", () => {
		const wrapper = shallow(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				enabledProviders={[ "facebook" ]}
				intl={intl}
				classes={{
					loginLink: loginLinkClass,
				}}
			/>
		);

		const loginButtons = wrapper.find(IconButton).filter(`.${loginLinkClass}`);
		expect(
			loginButtons.filterWhere(
				(el) => el.key() === "twitter"
			)
		).not.toExist();
	});

	it("should call login callback with the appropriate provider when login button is clicked", () => {
		const onLogin = jest.fn();

		const selectedProvider = "facebook";

		const wrapper = shallow(
			<AccountDialog
				onLogin={onLogin}
				onLogout={NO_OP}
				enabledProviders={[ selectedProvider, "twitter" ]}
				intl={intl}
				classes={{
					loginLink: loginLinkClass,
				}}
			/>
		);

		const loginButton = wrapper.find(IconButton).filterWhere(
			(el) => el.hasClass(loginLinkClass) && el.key() === selectedProvider
		);

		expect(loginButton).toExist();

		loginButton.simulate("click");

		expect(onLogin).toHaveBeenCalledWith({ provider: selectedProvider });
	});

	it("should show user display name if a user is logged in", () => {
		const displayName = "Test Tester";

		const loggedInUser = fromJS({
			name: {
				display: displayName,
			},
			username: "tester@example.com",
			provider: "facebook",
		});

		const wrapper = shallow(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				intl={intl}
				loggedInUser={loggedInUser}
				classes={{}}
			/>
		).find(CardHeader).shallow().shallow();

		expect(wrapper.find(Link).filterWhere((el) => el.children().text() === displayName)).toExist();
	});

	it("should call logout callback when logout button clicked", () => {
		const displayName = "Test Tester";

		const loggedInUser = fromJS({
			name: {
				display: displayName,
			},
			provider: "facebook",
		});

		const onLogout = jest.fn();

		const wrapper = shallow(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={onLogout}
				intl={intl}
				loggedInUser={loggedInUser}
				classes={{}}
			/>
		);

		const logoutButton = wrapper.find(Button).filterWhere(
			(button) => button.findWhere(
				(el) => el.is(Icon) && el.text() === "log out"
			)
		);

		expect(logoutButton).toExist();

		logoutButton.simulate("click");

		expect(onLogout).toHaveBeenCalled();
	});
});
