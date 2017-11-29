import React              from "react";
import PropTypes          from "prop-types";
import { is }             from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";
import classnames         from "classnames";
import {
	ImmutablePuzzle
}                         from "xpuz";
import Cell               from "project/scripts/components/CrosswordGrid/Cell";
import {
	DIRECTIONS,
	ERROR_OPTIONS
}                         from "project/scripts/constants";
import                         "./CrosswordGrid.less";

const FONT_SIZE_STEP = 0.1;

class CrosswordGrid extends React.PureComponent {
	static propTypes = {
		puzzle: PropTypes.instanceOf(ImmutablePuzzle).isRequired,
		className: PropTypes.string,
		fontAdjust: PropTypes.number,
		selectedCellPosition: ImmutablePropTypes.listOf(PropTypes.number),
		focusSelectedCell: PropTypes.bool,
		currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)),
		errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
		onInputCellSelect: PropTypes.func,
		onCellClick: PropTypes.func,
		onCellChange: PropTypes.func,
		onMoveFocus: PropTypes.func,
		toggleDirection: PropTypes.func,
		showUserSolutions: PropTypes.bool,
	}

	static defaultProps = {
		fontAdjust: 0,
		showUserSolutions: true,
		focusSelectedCell: true,
	}

	componentDidMount() {
		if (this.selectedCellInput && this.props.focusSelectedCell) {
			this.selectedCellInput.focus();
		}
	}

	componentDidUpdate(prevProps) {
		if (
			this.selectedCellInput &&
			!is(this.props.selectedCellPosition, prevProps.selectedCellPosition)
		) {
			this.selectedCellInput.focus();
		}		
	}

	handleInputCellFocus = ({ position, cell }) => {
		this.props.onInputCellSelect && this.props.onInputCellSelect({
			position,
			cell,
			currentDirection: this.props.currentDirection,
		});
	}

	handleCellClick = ({ event, cell, position }) => {
		this.props.onCellClick && this.props.onCellClick({ event, cell, position });
	}

	defaultMoveFocusHandler = ({ currentPosition, isForward, direction }) => {
		let newFocusCellPosition;
		let newFocusCell;
		const { grid } = this.props.puzzle;
		const height = grid.size;
		const width = grid.first().size;
		let [columnIndex, rowIndex] = currentPosition;

		if (direction === DIRECTIONS.Down) {
			rowIndex += isForward ? 1 : -1;

			while (!newFocusCellPosition && rowIndex < height && rowIndex >= 0) {
				let cell = grid.getIn([rowIndex, columnIndex]);

				if (!cell.get("isBlockCell")) {
					newFocusCellPosition = [columnIndex, rowIndex];
					newFocusCell = cell;
				}
				
				rowIndex += isForward ? 1 : -1;
			}
		}
		else {
			while (!newFocusCellPosition && columnIndex < width && columnIndex >= 0) {
				columnIndex += isForward ? 1 : -1;
				let cell = grid.getIn([rowIndex, columnIndex]);

				if (cell && !cell.get("isBlockCell")) {
					newFocusCellPosition = [columnIndex, rowIndex];
					newFocusCell = cell;
				}
			}
		}

		if (newFocusCellPosition) {
			this.props.onInputCellSelect && this.props.onInputCellSelect({
				position: newFocusCellPosition,
				cell: newFocusCell,
				currentDirection: direction,
			});
		}
	}

	onMoveFocus = ({ currentPosition, isForward, direction }) => {
		if (this.props.onMoveFocus) {
			this.props.onMoveFocus({currentPosition, isForward, direction});
		}
		else if (this.props.onMoveFocus === undefined) {
			this.defaultMoveFocusHandler({ currentPosition, isForward, direction });
		}
	}

	triggerMoveFocus = ({ currentPosition, isForward, direction }) => {
		this.onMoveFocus({
			currentPosition,
			isForward,
			direction,
		});
	}

	triggerCellContentChange = ({ event, position, value, wasDelete }) => {
		value = value.toUpperCase();

		event.preventDefault();
		this.props.onCellChange && this.props.onCellChange({
			position,
			value,
			wasDelete,
		});
	}

	getNextPosition = ({ currentPosition, isForward, direction }) => {
		let newPosition;
		let newCell;
		const { grid } = this.props.puzzle;
		const height = grid.size;
		const width = grid.first().size;
		let [columnIndex, rowIndex] = currentPosition;

		if (direction === DIRECTIONS.Down) {
			rowIndex += isForward ? 1 : -1;

			while (!newPosition && rowIndex < height && rowIndex >= 0) {
				let cell = grid.getIn([rowIndex, columnIndex]);

				if (!cell.get("isBlockCell")) {
					newPosition = [columnIndex, rowIndex];
					newCell = cell;
				}
				
				rowIndex += isForward ? 1 : -1;
			}
		}
		else {
			while (!newPosition && columnIndex < width && columnIndex >= 0) {
				columnIndex += isForward ? 1 : -1;
				let cell = grid.getIn([rowIndex, columnIndex]);

				if (cell && !cell.get("isBlockCell")) {
					newPosition = [columnIndex, rowIndex];
					newCell = cell;
				}
			}
		}

		if (!newPosition) {
			return null;
		}

		return {
			position: newPosition,
			cell: newCell,
		};
	}

	handleInputCellKeyDown = ({ event, position }) => {
		switch(event.key) {
			case "ArrowRight":
				this.triggerMoveFocus({
					currentPosition: position,
					isForward: true,
					direction: "across",
				});
				event.preventDefault();
				return;

			case "ArrowDown":
				this.triggerMoveFocus({
					currentPosition: position,
					isForward: true,
					direction: "down",
				});
				event.preventDefault();
				return;

			case "ArrowLeft":
				this.triggerMoveFocus({
					currentPosition: position,
					isForward: false,
					direction: "across",
				});
				event.preventDefault();
				return;

			case "ArrowUp":
				this.triggerMoveFocus({
					currentPosition: position,
					isForward: false,
					direction: "down",
				});
				event.preventDefault();
				return;

			case " ":
				this.props.toggleDirection && this.props.toggleDirection({
					position,
					currentDirection: this.props.currentDirection
				});
				event.preventDefault();
				return;

			case "Backspace": {
				let value = event.target.value;

				if (value.length === 0) {
					this.triggerMoveFocus({
						currentPosition: position,
						direction: this.props.currentDirection,
						isForward: false,
					});

					this.triggerCellContentChange({
						event,
						position,
						value,
						wasDelete: true,
					});
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

				this.triggerCellContentChange({
					event,
					position,
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

				this.triggerCellContentChange({
					event,
					position,
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
			if (event.key.length === 1) {
				// If the key name is 1 character long, assume it's a printable character (e.g.
				// digit, punctuation). If it's longer than 1 character, it's probably a non-printable
				// key (e.g. "F1", "Insert", ...). We don't want to trap those keys, so we don't
				// prevent their default, we just return.
				event.preventDefault();
			}
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

		this.triggerCellContentChange({
			event,
			position,
			value
		});
	}

	render() {
		const {
			puzzle,
			fontAdjust,
			errorOption,
			className,
			selectedCellPosition,
			currentDirection,
			showUserSolutions
		} = this.props;

		const fontSize = 1 + (fontAdjust * FONT_SIZE_STEP);
		const highlightErrors = errorOption === ERROR_OPTIONS.Highlight || errorOption === ERROR_OPTIONS.Reveal;

		const rootProps = {
			className: classnames(
				"c_crossword-grid",
				className,
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

		const selectedCell = selectedCellPosition &&
			puzzle.grid.getIn([selectedCellPosition.get(1), selectedCellPosition.get(0)]);

		const highlightedClueNumber = selectedCell && selectedCell.getIn(["containingClues", currentDirection]);

		return (
			<div
				{...rootProps}
			>
				<table
					className="c_crossword-grid--grid"
				>
					<tbody>
						{
							puzzle.grid.map(
								(row, rowIndex) => (
									<tr
										key={rowIndex}
										className="c_crossword-grid--grid--row"
									>
										{
											row.map(
												(cell, columnIndex) => {
													const userSolution = puzzle.userSolution &&
														puzzle.userSolution.getIn([rowIndex, columnIndex]);

													// Highlight all cells in the current direction with the same clue number
													const highlighted = !cell.get("isBlockCell") &&
														highlightedClueNumber &&
														highlightedClueNumber === cell.getIn(["containingClues", currentDirection]);
													const position = [columnIndex, rowIndex];
													let isSelected = false;

													const ref = {};

													if (
														selectedCellPosition &&
														selectedCellPosition.get(0) === position[0] &&
														selectedCellPosition.get(1) === position[1]
													) {
														isSelected = true;
														ref.ref = (input) => this.selectedCellInput = input;
													}

													let cellValue;

													if (showUserSolutions) {
														cellValue = userSolution;
														
														if (errorOption === ERROR_OPTIONS.Reveal && !userSolution) {
															cellValue = cell.get("solution");
														}

														if (!cellValue) {
															cellValue = "";
														}
													}
													else {
														cellValue = cell.get("solution");
													}

													return (
														<Cell
															key={`${rowIndex}-${columnIndex}`}
															className="c_crossword-grid--grid--cell"
															clueNumber={cell.get("clueNumber")}
															isBlockCell={cell.get("isBlockCell")}
															isHighlighted={highlighted}
															isSelected={isSelected}
															hasError={highlightErrors && (!userSolution ||
																userSolution !== cell.get("solution"))}
															hasUserSolution={!!userSolution}
															value={cellValue}
															onClick={(event) => this.handleCellClick({
																event,
																cell,
																position
															})}
															onFocus={() => this.handleInputCellFocus({
																cell,
																position,
															})}
															onKeyDown={(event) => this.handleInputCellKeyDown({
																event,
																position,
															})}
															inputProps={ref}
														/>
													);
												}
											).toArray()
										}
									</tr>
								)
							).toArray()
						}
					</tbody>
				</table>
			</div>
		);
	}
}

export default CrosswordGrid;
