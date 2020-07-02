import React from "react";
import PropTypes from "prop-types";
import configureStore from "redux-mock-store";
import { runSaga as realRunSaga } from "redux-saga";
import { IntlProvider } from "react-intl";
import { mount as enzymeMount, shallow as enzymeShallow } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import Renderer from "react-test-renderer";

import { translationMessages } from "@app/i18n";
import createReducer from "@app/reducers";

const locale = "en";
const defaultLocale = "en";

const _mockStore = configureStore();

export const mockStore = (initialState, ...args) => {
	if (!initialState) {
		initialState = createReducer()(undefined, {});
	}

	const store = _mockStore(initialState, ...args);

	store.runSaga = () => {};

	return store;
};

const WrapperComponent = ({ children, store }) => (
	<MemoryRouter>
		<Provider store={store}>
			<IntlProvider
				locale={locale}
				defaultLocale={defaultLocale}
				messages={translationMessages[locale]}
			>
				{children}
			</IntlProvider>
		</Provider>
	</MemoryRouter>
);

WrapperComponent.propTypes = {
	children: PropTypes.any,
	store: PropTypes.object,
};

export const mount = (node, {
	store = mockStore(),
} = {}) => enzymeMount(node, {
	wrappingComponent: WrapperComponent,
	wrappingComponentProps: {
		store,
	},
});

export const shallow = (node, {
	store = mockStore(),
} = {}) => enzymeShallow(node, {
	wrappingComponent: WrapperComponent,
	wrappingComponentProps: {
		store
	},
});

export const renderComponent = (node, {
	store = mockStore(),
} = {}) => Renderer.create(
	<WrapperComponent
		store={store}
	>
		{node}
	</WrapperComponent>
);

export async function runSaga({
	state,
	getSaga,
}, ...args) {
	const dispatched = [];

	const rootSaga = await getSaga();

	const dispatchers = [];

	const reducer = createReducer();

	state = state || reducer(undefined, {});

	const getDispatch = (pushToArray = true) => {
		return (action) => {
			if (pushToArray) {
				dispatched.push(action);
			}

			state = reducer(state, action);
		};
	};

	const dispatchWithoutPushing = getDispatch(false);

	const sagaPromise = realRunSaga(
		{
			dispatch: getDispatch(),
			getState: () => state,
			subscribe: (callback) => {
				const wrappedCallback = (action, ...args) => {
					dispatchWithoutPushing(action);
					return callback(action, ...args);
				};

				dispatchers.push(wrappedCallback);

				return () => {
					const index = dispatchers.findIndex(wrappedCallback);

					if (index >= 0) {
						delete dispatchers[index];
					}
				};
			},
		},
		rootSaga,
		...args
	).done;

	return {
		dispatchers,
		dispatched,
		sagaPromise,
	};
}
