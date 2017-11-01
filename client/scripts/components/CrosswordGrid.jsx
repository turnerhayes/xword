import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import classnames         from "classnames";
import {
	ImmutablePuzzle
}                         from "xpuz";
import {
	DIRECTIONS,
	ERROR_OPTIONS
}                         from "project/scripts/constants";
import                         "project/styles/crossword-grid.less";

const FONT_SIZE_STEP = 0.1;

function handleInputCellFocus({ props, position }) {
	props.onInputCellSelect && props.onInputCellSelect({
		position,
		cell: props.puzzle.grid.getIn([position[1], position[0]]),
	});
}

function handleCellClick({ props, event, cell, position }) {
	props.onCellClick && props.onCellClick({ event, cell, position });
}

function triggerMoveFocus({ props, currentPosition, isForward, direction }) {
	props.onMoveFocus && props.onMoveFocus({
		currentPosition,
		isForward,
		direction
	});
}

function triggerCellContentChange({ event, props, position, value, wasDelete }) {
	value = value.toUpperCase();

	event.preventDefault();
	props.onCellChange && props.onCellChange({
		position,
		value,
		wasDelete,
	});
}

function handleInputCellKeyDown({ event, position, props }) {
	switch(event.key) {
		case "ArrowRight":
			triggerMoveFocus({
				props,
				currentPosition: position,
				isForward: true,
				direction: "across",
			});
			event.preventDefault();
			return;

		case "ArrowDown":
			triggerMoveFocus({
				props,
				currentPosition: position,
				isForward: true,
				direction: "down",
			});
			event.preventDefault();
			return;

		case "ArrowLeft":
			triggerMoveFocus({
				props,
				currentPosition: position,
				isForward: false,
				direction: "across",
			});
			event.preventDefault();
			return;

		case "ArrowUp":
			triggerMoveFocus({
				props,
				currentPosition: position,
				isForward: false,
				direction: "down",
			});
			event.preventDefault();
			return;

		case " ":
			props.toggleDirection && props.toggleDirection({ position });
			event.preventDefault();
			return;

		case "Backspace": {
			let value = event.target.value;

			if (value.length === 0) {
				event.preventDefault();
				return;
			}
			else if (value.length === 1) {
				value = "";
			}
			// Cursor is at the start of the text--do nothing
			else if (event.target.selectionStart === 0) {
				event.preventDefault();
				return;
			}
			else {
				// Remove character before cursor, like Backspace normally does
				value = value.substring(0, event.target.selectionStart - 1) + value.substring(event.target.selectionEnd);
			}

			triggerCellContentChange({
				event,
				position,
				props,
				value,
				wasDelete: true,
			});

			return;
		}

		case "Delete": {
			let value = event.target.value;

			if (value.length === 0) {
				event.preventDefault();
				return;
			}
			else if (value.length === 1) {
				value = "";
			}
			// Cursor is at the start of the text--do nothing
			else if (event.target.selectionStart === 0) {
				event.preventDefault();
				return;
			}
			else {
				// Remove character after cursor, like Delete normally does
				value = value.substring(0, event.target.selectionStart) + value.substring(event.target.selectionEnd + 1);
			}

			triggerCellContentChange({
				event,
				position,
				props,
				value,
				wasDelete: true,
			});

			return;
		}

		// No special handling of these keys, but we don't want to trap them in the alphabetic check
		// below
		case "Tab":
			return;
	}

	if (!/^[a-zA-Z]$/.test(event.key)) {
		event.preventDefault();
		return;
	}

	if (event.ctrlKey || event.altKey) {
		// Let key combos through (e.g. Ctrl + R)
		return;
	}

	let value;

	// If there's already content in the field, we want to replace it, unless the shift key is
	// held down.
	if (event.target.value && event.shiftKey) {
		value = event.target.value.substring(0, event.target.selectionStart) +
			event.key + event.target.value.substring(event.target.selectionEnd + 1);
	}
	else {
		value = event.key;
	}

	triggerCellContentChange({
		event,
		position,
		props,
		value
	});
}

function CrosswordGrid(props) {
	const fontSize = 1 + (props.fontAdjust * FONT_SIZE_STEP);
	const highlightErrors = props.errorOption === ERROR_OPTIONS.Highlight || props.errorOption === ERROR_OPTIONS.Reveal;

	const rootProps = {
		className: classnames(
			"c_crossword-grid",
			props.className,
			{
				"show-errors": highlightErrors,
			}
		),
	};

	if (fontSize !== 1) {
		rootProps.style = {
			fontSize: `${fontSize}em`,
		};
	}

	const selectedCell = props.selectedCellPosition &&
		props.puzzle.grid.getIn([props.selectedCellPosition.get(1), props.selectedCellPosition.get(0)]);

	const highlightedClueNumber = selectedCell && selectedCell.getIn(["containingClues", props.currentDirection]);

	return (
		<div
			{...rootProps}
		>
			<table
				className="c_crossword-grid--grid"
			>
				<tbody>
					{
						props.puzzle.grid.map(
							(row, rowIndex) => (
								<tr
									key={rowIndex}
									className="c_crossword-grid--grid--row"
								>
									{
										row.map(
											(cell, columnIndex) => {
												const userSolution = props.puzzle.userSolution &&
													props.puzzle.userSolution.getIn([rowIndex, columnIndex]);


												// Highlight all cells in the current direction with the same clue number
												const highlighted = !cell.get("isBlockCell") &&
													highlightedClueNumber &&
													highlightedClueNumber === cell.getIn(["containingClues", props.currentDirection]);
												const position = [columnIndex, rowIndex];

												const cellProps = {
													className: classnames(
														"c_crossword-grid--grid--cell",
														{
															"block-cell": cell.get("isBlockCell"),
															"input-cell": !cell.get("isBlockCell"),
															"is-highlighted": highlighted,
															"is-error": highlightErrors && !cell.get("isBlockCell") && userSolution &&
																userSolution !== cell.get("solution"),
															"has-user-solution": !cell.get("isBlockCell") && !!userSolution,
														}
													),
													onClick: (event) => handleCellClick({ props, event, cell, position }),
												};

												if (cell.get("clueNumber")) {
													cellProps["data-clue-number"] = cell.get("clueNumber");
												}

												const ref = {};

												if (
													props.selectedCellPosition &&
													props.selectedCellPosition.get(0) === position[0] &&
													props.selectedCellPosition.get(1) === position[1]
												) {
													ref.ref = (input) => input && input.focus();
												}

												let cellValue = userSolution;

												if (props.errorOption === ERROR_OPTIONS.Reveal && !userSolution) {
													cellValue = cell.get("solution");
												}

												if (!cellValue) {
													cellValue = "";
												}

												return (
													<td
														key={`${rowIndex}-${columnIndex}`}
														{...cellProps}
													>
													{
														!cell.isBlockCell && (
															<input
																className="letter-input"
																type="text"
																value={cellValue}
																onChange={() => {}}
																onFocus={() => handleInputCellFocus({
																	props,
																	cell,
																	position,
																})}
																onKeyDown={(event) => handleInputCellKeyDown({
																	event,
																	position,
																	props,
																})}
																{...ref}
															/>
														)
													}
													</td>
												);
											}
										)
									}
								</tr>
							)
						)
					}
				</tbody>
			</table>
		</div>
	);
}

CrosswordGrid.propTypes = {
	puzzle: PropTypes.instanceOf(ImmutablePuzzle).isRequired,
	className: PropTypes.string,
	fontAdjust: PropTypes.number,
	selectedCellPosition: ImmutablePropTypes.listOf(PropTypes.number),
	currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)),
	errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
	onInputCellSelect: PropTypes.func,
	onCellClick: PropTypes.func,
	onCellChange: PropTypes.func,
	toggleDirection: PropTypes.func,
};

CrosswordGrid.defaultProps = {
	fontAdjust: 0,
};

export default CrosswordGrid;
