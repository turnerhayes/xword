import React              from "react";
import PropTypes          from "prop-types";
import { withStyles }     from "@material-ui/core/styles";
import Divider            from "@material-ui/core/Divider";
import PuzzleErrorOptions from "@app/components/PuzzleErrorOptions";
import FontSizePicker     from "@app/components/FontSizePicker";
import {
	ERROR_OPTIONS
}                         from "@app/constants";
// import                         "./PuzzleSettings.less";

const styles = {
	root: {
		padding: "0.5em",
	},
};

function PuzzleSettings(props) {
	return (
		<div
			className={props.classes.root}
		>
			<div
			>
				<h3>Errors</h3>
				<PuzzleErrorOptions
					errorOption={props.errorOption}
					onChange={props.onErrorOptionChange}
				/>
			</div>
			<Divider />
			<div
			>
				<h3>Font Size</h3>
				<FontSizePicker
					onAdjustChange={props.onFontSizeAdjustChange}
					currentAdjust={props.currentFontSizeAdjust}
					maxAdjust={props.maxFontSizeAdjust}
					minAdjust={props.minFontSizeAdjust}
				/>
			</div>
		</div>
	);
}

PuzzleSettings.propTypes = {
	classes: PropTypes.object.isRequired,
	errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
	onErrorOptionChange: PropTypes.func.isRequired,
	onFontSizeAdjustChange: PropTypes.func.isRequired,
	currentFontSizeAdjust: PropTypes.number.isRequired,
	maxFontSizeAdjust: PropTypes.number.isRequired,
	minFontSizeAdjust: PropTypes.number.isRequired,
};

export default withStyles(styles)(PuzzleSettings);
