import React from "react";
import { fromJS } from "immutable";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { mount, renderComponent } from "@app/utils/test-utils";

import AccountDialog from "./AccountDialog";

const NO_OP = () => {};

describe("AccountDialog component", () => {
	const loginLinkClass = "login-link";

	it("should show a login link for each supported provider if no user is logged in", () => {
		const providers = [ "facebook", "google", "twitter" ];

		const component = renderComponent(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				enabledProviders={providers}
				classes={{}}
			/>
		);

		expect(component.toJSON()).toMatchSnapshot();
	});

	it("should not show a login link for a provider if that provider is not supported", () => {
		const component = renderComponent(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				enabledProviders={[ "facebook" ]}
				classes={{}}
			/>
		);

		expect(component.toJSON()).toMatchSnapshot();
	});

	it("should call login callback with the appropriate provider when login button is clicked", () => {
		const onLogin = jest.fn();

		const selectedProvider = "facebook";

		const wrapper = mount(
			<AccountDialog
				onLogin={onLogin}
				onLogout={NO_OP}
				enabledProviders={[ selectedProvider, "twitter" ]}
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

		const component = renderComponent(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={NO_OP}
				loggedInUser={loggedInUser}
				classes={{}}
			/>
		);

		expect(component.toJSON()).toMatchSnapshot();
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

		const wrapper = mount(
			<AccountDialog
				onLogin={NO_OP}
				onLogout={onLogout}
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
