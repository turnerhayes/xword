import React      from "react";
import PropTypes  from "prop-types";
import classnames from "classnames";
import                 "./Cell.less";

const noOp = () => {};

export default function Cell(props) {
	const {
		isBlockCell,
		isHighlighted,
		isSelected,
		hasError,
		hasUserSolution,
		clueNumber,
		value,
		className,
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
				"c_crossword-grid-cell",
				className,
				{
					"block-cell": isBlockCell,
					"input-cell": !isBlockCell,
					"is-highlighted": isHighlighted,
					"is-selected": isSelected,
					"has-error": !isBlockCell && hasError,
					"has-user-solution": !isBlockCell && hasUserSolution,
				}
			)}
			onClick={onClick}
			{...cellProps}
		>
		{
			!isBlockCell && (
				<input
					className="letter-input"
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
	isBlockCell: PropTypes.bool.isRequired,
	isHighlighted: PropTypes.bool,
	isSelected: PropTypes.bool,
	hasError: PropTypes.bool,
	hasUserSolution: PropTypes.bool,
	clueNumber: PropTypes.number,
	value: PropTypes.string,
	className: PropTypes.string,
	inputProps: PropTypes.object,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
	onKeyDown: PropTypes.func,
};

Cell.defaultProps = {
	isBlockCell: false,
	isHighlighted: false,
};
