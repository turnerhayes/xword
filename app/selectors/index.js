import { Map }            from "immutable";

import { wrapSelectors }  from "./utils";
import uiSelectors        from "./ui";
import userSelectors      from "./users";
import settingsSelectors  from "./settings";

const wrappedUsers = wrapSelectors({
	selectors: userSelectors,
	sliceSelector: ["users"],
	defaultValue: Map(),
});

const wrappedUI = wrapSelectors({
	selectors: uiSelectors,
	sliceSelector: ["ui"],
	defaultValue: Map(),
});

const wrappedSettings = wrapSelectors({
	selectors: settingsSelectors,
	sliceSelector: ["settings"],
	defaultValue: Map(),
});

export default {
	ui: wrappedUI,
	users: wrappedUsers,
	settings: wrappedSettings,
};
