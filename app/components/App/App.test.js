import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { intlShape } from "react-intl";
import fetchMock from "fetch-mock";
import Loadable from "react-loadable";
import * as immutableMatchers from "jest-immutable-matchers";
import { intl, mockStore } from "@app/utils/test-utils";
import App from "./index";


beforeAll(() => {
	fetchMock.get("*", {});

	jest.addMatchers(immutableMatchers);

	// Make sure that Loadable containers are loaded so that we don't get
	// an not-yet-loaded Loadable component when we render the routes
	return Loadable.preloadAll();
});

describe("App component", () => {
	it("should render a HomePage component for the / route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			(
				<MemoryRouter
					initialEntries={[ "/" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
		);

		expect(wrapper.find("HomePage")).toExist();
	});

	it("should render a NotFoundPage component for an unmapped route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			(
				<MemoryRouter
					initialEntries={[ "/this-is-not-a-real-route-dude" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
		);

		expect(wrapper.find("NotFoundPage")).toExist();
	});
});
