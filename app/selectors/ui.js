import assert from "assert";

const getSetting = (state, props) => {
	assert(props.section, "`section` is required");
	assert(props.settingName, "`settingName` is required");

	return state.getIn([
		props.section,
		...(
			Array.isArray(props.settingName) ?
				props.settingName :
				[props.settingName]
		)
	]);
};

export default {
	getSetting,
};
