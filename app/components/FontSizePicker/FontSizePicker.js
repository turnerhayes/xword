import React      from "react";
import PropTypes  from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Icon       from "@material-ui/core/Icon";
// import                 "font-awesome/less/font-awesome.less";


const styles = {
	adjustButton: {
		"-webkit-appearance": "none",
		"-moz-appearance": "none",
		background: "none",
		border: "none",
		cursor: "pointer",
	},
};

class FontSizePicker extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		currentAdjust: PropTypes.number.isRequired,
		onAdjustChange: PropTypes.func.isRequired,
		maxAdjust: PropTypes.number,
		minAdjust: PropTypes.number,
	}

	static defaultProps = {
		currentAdjust: 0,
	}

	handleAdjustChange = (up) => {
		let newValue = this.props.currentAdjust + (up ? 1 : -1);

		if (newValue >= this.props.minAdjust && newValue <= this.props.maxAdjust) {
			this.props.onAdjustChange(newValue);
		}
	}

	handleAdjustUp = () => {
		this.handleAdjustChange(true);
	}

	handleAdjustDown = () => {
		this.handleAdjustChange(false);
	}

	render() {
		return (
			<div
				className="c_font-size-picker"
			>
				<IconButton
					className={this.props.classes.adjustButton}
					onClick={this.handleAdjustDown}
				>
					<Icon
						className="icon"
					>zoom out</Icon>
				</IconButton>
				<Icon
					className="icon"
				>font</Icon>
				<IconButton
					className={this.props.classes.adjustButton}
					onClick={this.handleAdjustUp}
				>
					<Icon
						className="icon"
					>zoom in</Icon>
				</IconButton>
			</div>
		);
	}
}

export default withStyles(styles)(FontSizePicker);
