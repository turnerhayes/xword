import React             from "react";
import PropTypes         from "prop-types";
import Icon              from "@material-ui/core/Icon";
import { withStyles }    from "@material-ui/core/styles";
import                        "@app/fonts/icomoon/style.css";

const styles = {
	root: {
		"@keyframes _xc-loading-spinner--spin": {
			from: {
				transform: "rotateZ(0deg)",
			},

			to: {
				transform: "rotateZ(-359deg)",
			},
		},

		display: "inline-block",
		animation: "_xc-loading-spinner--spin 1s infinite linear",
	},
};

function LoadingSpinner({ classes }) {
	return (
		<Icon
			className={classes.root}
		>
			loading
		</Icon>
	);
}

LoadingSpinner.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadingSpinner);
