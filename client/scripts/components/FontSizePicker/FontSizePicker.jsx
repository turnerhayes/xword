import React      from "react";
import PropTypes  from "prop-types";
import IconButton from "material-ui/IconButton";
import Icon       from "material-ui/Icon";
import                 "font-awesome/less/font-awesome.less";
import                 "./FontSizePicker.less";

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
			<IconButton
				className="c_font-size-picker--adjust-button"
				onClick={() => handleAdjustChange(props, false)}
			>
				<Icon
					className="icon"
				>zoom out</Icon>
			</IconButton>
			<Icon
				className="icon"
			>font</Icon>
			<IconButton
				className="c_font-size-picker--adjust-button"
				onClick={() => handleAdjustChange(props, true)}
			>
				<Icon
					className="icon"
				>zoom in</Icon>
			</IconButton>
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
