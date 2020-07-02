import React from "react";
import { MemoryRouter } from "react-router";
import Loadable from "react-loadable";
import IconButton from "@material-ui/core/IconButton";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Popover from "@material-ui/core/Popover";
import SimpleBackdrop from "@material-ui/core/Modal/SimpleBackdrop";

import AccountDialog from "@app/components/AccountDialog";
import { mockStore, mount } from "@app/utils/test-utils";

import TopNavigation from "./TopNavigation";


describe("TopNavigation component", () => {
	describe("Menu buttons", () => {
		fit("should open the account dialog popup when account button clicked", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);
			
			// The AccountDialog is wrapped in a Loadable, so is not immediately
			// rendered on mount unless we preload them here
			await Loadable.preloadAll();

			const store = mockStore();

			const wrapper = mount(
				(
					<MemoryRouter>
						<TopNavigation
							classes={{}}
						/>
					</MemoryRouter>
				),
				{
					store,
				}
			);

			const iconButton = wrapper.find(IconButton).filterWhere(
				(button) => button.find(AccountCircleIcon).exists()
			);

			iconButton.simulate("click");

			wrapper.update();

			const accountDialog = wrapper.find(AccountDialog);

			expect(accountDialog).toExist();
			expect(accountDialog.closest(Popover)).toHaveProp("open", true);

			wrapper.find(SimpleBackdrop).simulate("click");

			expect(wrapper.find("AccountDialog").closest(Popover)).toHaveProp("open", false);
		});
	});

	describe("Links", () => {
		it("should have a link to home", () => {
			const wrapper = mount(
				<TopNavigation
					classes={{}}
				/>
			);

			expect(wrapper.find("Link[to='/']")).toExist();
		});
	});
});
