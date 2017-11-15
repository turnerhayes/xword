import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Popover            from "material-ui/Popover";
import IconButton         from "material-ui/IconButton";
import Icon               from "material-ui/Icon";
import {
	ImmutablePuzzle
}                         from "xpuz";
import CrosswordGrid      from "project/scripts/containers/CrosswordGrid";
import CrosswordClues     from "project/scripts/components/CrosswordClues";
import PuzzlePicker       from "project/scripts/components/PuzzlePicker";
import PuzzleSettings     from "project/scripts/containers/PuzzleSettings";
import {
	DIRECTIONS
}                         from "project/scripts/constants";
import                         "project/styles/solve-puzzle.less";

function capitalize(str) {
	if (!str) {
		return str;
	}

	if (str.length === 1) {
		return str.toUpperCase();
	}

	return str[0].toUpperCase() + str.substring(1);
}

/*
 * Component representing the home page.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class SolvePuzzle extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
	 */
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		puzzle: PropTypes.instanceOf(ImmutablePuzzle),
		existingPuzzles: ImmutablePropTypes.listOf(PropTypes.instanceOf(ImmutablePuzzle)),
		currentPuzzleIndex: PropTypes.number,
		selectedCellPosition: ImmutablePropTypes.listOf(PropTypes.number),
		onPuzzleSelected: PropTypes.func,
		onInputCellSelect: PropTypes.func,
		setDirection: PropTypes.func,
		addPuzzle: PropTypes.func,
		setPuzzleCellContent: PropTypes.func,
		currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)),
	}

	static defaultProps = {
		children: [],
	}

	state = {
		settingsPopoverIsOpen: false,
		settingsPopoverAnchorEl: null,
	}

	handleFileUpload = ({ puzzle }) => {
		this.props.addPuzzle && this.props.addPuzzle({ puzzle });
	}

	handleFileUploadFailure = (error) => {
		console.error(error);
	}

	handlePuzzleSelected = ({ index }) => {
		this.props.onPuzzleSelected && this.props.onPuzzleSelected({ index });
	}

	handleInputCellSelect = ({ cell, position }) => {
		this.props.onInputCellSelect && this.props.onInputCellSelect({ cell, position });
	}

	handleCellChange = ({ position, value, wasDelete }) => {
		this.props.setPuzzleCellContent({
			puzzleIndex: this.props.currentPuzzleIndex,
			position,
			value,
		});

		if (!wasDelete) {
			this.handleMoveFocus({
				currentPosition: position,
				isForward: true,
				direction: this.props.currentDirection,
			});
		}
	}

	handleMoveFocus = ({ currentPosition, isForward, direction }) => {
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
			});
		}
	}

	toggleDirection = ({ position }) => {
		const cell = this.props.puzzle.grid.getIn([position[1], position[0]]);

		this.props.setDirection({
			direction: this.props.currentDirection === DIRECTIONS.Across || !cell.getIn(["containingClues", "across"]) ?
				DIRECTIONS.Down :
				DIRECTIONS.Across,
		});
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const selectedCell = this.props.puzzle && this.props.selectedCellPosition &&
			this.props.puzzle.grid.getIn([this.props.selectedCellPosition.get(1), this.props.selectedCellPosition.get(0)]);
		const selectedClue = selectedCell && {
			number: selectedCell.getIn(["containingClues", this.props.currentDirection]),
			text: this.props.puzzle.clues.getIn([
				this.props.currentDirection,
				selectedCell.getIn([
					"containingClues",
					this.props.currentDirection
				]).toString() // Keys in the clues map are strings
			])
		};

		return (
			<div
				className="c_solve-puzzle"
			>
				<Popover
					open={this.state.settingsPopoverIsOpen}
					anchorEl={this.state.settingsPopoverAnchorEl}
					onRequestClose={() => this.setState({
						settingsPopoverIsOpen: false,
					})}
					anchorOrigin={{horizontal: "right", vertical: "bottom"}}
					transformOrigin={{horizontal: "right", vertical: "top"}}
				>
					<PuzzleSettings
						uiSection="SolvePuzzle"
						maxFontSizeAdjust={3}
						minFontSizeAdjust={-2}
					/>
				</Popover>
				<IconButton
					className="c_solve-puzzle--puzzle-settings-button"
					onClick={(event) => this.setState({
						settingsPopoverIsOpen: true,
						settingsPopoverAnchorEl: event.target,
					})}
				>
					<Icon
						className="fa fa-gear"
					/>
				</IconButton>
				<PuzzlePicker
					onUploadSuccess={this.handleFileUpload}
					onUploadFailure={this.handleFileUploadFailure}
					existingPuzzles={this.props.existingPuzzles}
					currentPuzzleIndex={this.props.currentPuzzleIndex}
					onPuzzleSelected={this.handlePuzzleSelected}
				/>
				{
					selectedClue && (
						<dl
							className="c_solve-puzzle--current-clue"
						>
							<dt>
								{selectedClue.number} {capitalize(this.props.currentDirection)}:
							</dt>
							<dd>
								{selectedClue.text}
							</dd>
						</dl>
					)
				}
				{
					this.props.puzzle &&
						(
							<div>
								<CrosswordGrid
									uiSection="SolvePuzzle"
									className="c_solve-puzzle--crossword-grid-container"
									puzzle={this.props.puzzle}
									onInputCellSelect={this.handleInputCellSelect}
									onCellChange={this.handleCellChange}
									selectedCellPosition={this.props.selectedCellPosition}
									toggleDirection={this.toggleDirection}
									onMoveFocus={this.handleMoveFocus}
								/>
								<CrosswordClues
									puzzle={this.props.puzzle}
									selectedClueNumber={selectedClue && selectedClue.number}
									currentDirection={this.props.currentDirection}
								/>
							</div>
						)
				}
			</div>
		);
	}
}

export default SolvePuzzle;
