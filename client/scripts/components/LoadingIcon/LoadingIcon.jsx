import React from "react";
import Icon  from "material-ui/Icon";
import classHelper from "project/scripts/classes";
import            "./LoadingIcon.less";

const classes = classHelper("loading-icon");

export default function LoadingIcon() {
	return (
		<Icon
			{...classes({
				extra: "icon",
			})}
		>loading</Icon>
	);
}
