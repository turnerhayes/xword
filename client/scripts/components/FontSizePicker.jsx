import React     from "react";
import PropTypes from "prop-types";
import                "font-awesome/less/font-awesome.less";
import                "project/styles/font-size-picker.less";

function handleAdjustChange(props, up) {
	let newValue = props.currentAdjust + (up ? 1 : -1);

	if (newValue >= props.minAdjust && newValue <= props.maxAdjust) {
		props.onAdjustChange(newValue);
	}
}

function FontSizePicker(props) {
	return (
		<div
			className="c_font-size-picker"
		>
			<button
				className="c_font-size-picker--adjust-button fa fa-minus"
				onClick={() => handleAdjustChange(props, false)}
			/>
			<span
				className="fa fa-font"
			/>
			<button
				className="c_font-size-picker--adjust-button fa fa-plus"
				onClick={() => handleAdjustChange(props, true)}
			/>
		</div>
	);
}

FontSizePicker.propTypes = {
	currentAdjust: PropTypes.number.isRequired,
	onAdjustChange: PropTypes.func.isRequired,
	maxAdjust: PropTypes.number,
	minAdjust: PropTypes.number,
};

FontSizePicker.defaultProps = {
	currentAdjust: 0,
};

export default FontSizePicker;
