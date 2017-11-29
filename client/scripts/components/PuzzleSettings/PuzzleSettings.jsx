import React              from "react";
import PropTypes          from "prop-types";
import Divider            from "material-ui/Divider";
import PuzzleErrorOptions from "project/scripts/components/PuzzleErrorOptions";
import FontSizePicker     from "project/scripts/components/FontSizePicker";
import {
	ERROR_OPTIONS
}                         from "project/scripts/constants";
import classHelper        from "project/scripts/classes";
import                         "./PuzzleSettings.less";

const classes = classHelper("puzzle-settings");

function PuzzleSettings(props) {
	return (
		<div
			{...classes()}
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
	errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
	onErrorOptionChange: PropTypes.func.isRequired,
	onFontSizeAdjustChange: PropTypes.func.isRequired,
	currentFontSizeAdjust: PropTypes.number.isRequired,
	maxFontSizeAdjust: PropTypes.number.isRequired,
	minFontSizeAdjust: PropTypes.number.isRequired,
};

export default PuzzleSettings;
