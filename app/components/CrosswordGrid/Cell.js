import React      from "react";
import PropTypes  from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";

const noOp = () => {};

const cellWidth = "4em";

const styles = {
	root: {
		width: cellWidth,
		minWidth: cellWidth,
		maxWidth: cellWidth,
		height: cellWidth,
		minHeight: cellWidth,
		maxHeight: cellWidth,
		border: "1px solid black",
	},

	blockCell: {
		backgroundColor: "#000000",
		userSelect: "none",
	},

	inputCell: {
		cursor: "text",
	},

	inputCellWithError: {
		outline: "1px inset #FF0000",
	},

	inputCellWithUserSolution: {
		outline: "none",
	},

	inputCellSelected: {
		boxShadow: "1px 1px 4px 2px darkturquoise",
		zIndex: "1",
	},

	highlightedCell: {
		backgroundColor: "#FFFF00",
	},

	hasClueNumber: {
		"&::before": {
			content: "attr(data-clue-number)",
			display: "inline-block",
			position: "absolute",
			top: 0,
			left: 0,
			margin: "0.2em",
		},
	},

	letterInput: {
		"-webkit-appearance": "none",
		border: "none",
		width: "100%",
		height: "100%",
		background: "none",
		fontSize: "2.5em",
		textTransform: "uppercase",
		textAlign: "center",
	},
};

function Cell(props) {
	const {
		classes,
		isBlockCell,
		isHighlighted,
		isSelected,
		hasError,
		hasUserSolution,
		clueNumber,
		value,
		inputProps,
		onClick,
		onFocus,
		onKeyDown,
		...cellProps
	} = props;

	if (clueNumber) {
		cellProps["data-clue-number"] = clueNumber;
	}

	return (
		<td
			className={classnames(
				classes.root,
				{
					[classes.blockCell]: isBlockCell,
					[classes.inputCell]: !isBlockCell,
					[classes.highlightedCell]: isHighlighted,
					[classes.inputCellSelected]: isSelected,
					[classes.inputCellWithError]: !isBlockCell && hasError,
					[classes.inputCellWithUserSolution]: !isBlockCell && hasUserSolution,
					[classes.hasClueNumber]: clueNumber,
				}
			)}
			onClick={onClick}
			{...cellProps}
		>
			{
				!isBlockCell && (
					<input
						className={classes.letterInput}
						type="text"
						value={value || ""}
						onFocus={onFocus}
						onKeyDown={onKeyDown}
						onChange={noOp}
						{...inputProps}
					/>
				)
			}
		</td>
	);
}

Cell.propTypes = {
	classes: PropTypes.object.isRequired,
	isBlockCell: PropTypes.bool.isRequired,
	isHighlighted: PropTypes.bool,
	isSelected: PropTypes.bool,
	hasError: PropTypes.bool,
	hasUserSolution: PropTypes.bool,
	clueNumber: PropTypes.number,
	value: PropTypes.string,
	inputProps: PropTypes.object,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
	onKeyDown: PropTypes.func,
};

Cell.defaultProps = {
	isBlockCell: false,
	isHighlighted: false,
};

export default withStyles(styles)(Cell);
