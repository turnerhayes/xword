import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	connect
}                         from "react-redux";
import Popover            from "material-ui/Popover";
import IconButton         from "material-ui/IconButton";
import {
	ImmutablePuzzle
}                         from "xpuz";
import {
	addPuzzle,
	setCurrentPuzzleIndex,
	setPuzzleCellContent,
	setUIState
}                         from "project/scripts/redux/actions";
import CrosswordGrid      from "project/scripts/components/CrosswordGrid";
import CrosswordClues     from "project/scripts/components/CrosswordClues";
import PuzzlePicker       from "project/scripts/components/PuzzlePicker";
import PuzzleSettings     from "project/scripts/components/PuzzleSettings";
import {
	DIRECTIONS,
	ERROR_OPTIONS
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
		dispatch: PropTypes.func.isRequired,
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		puzzle: PropTypes.instanceOf(ImmutablePuzzle),
		existingPuzzles: ImmutablePropTypes.listOf(PropTypes.instanceOf(ImmutablePuzzle)),
		currentPuzzleIndex: PropTypes.number,
		fontAdjust: PropTypes.number,
		selectedCellPosition: ImmutablePropTypes.listOf(PropTypes.number),
		currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)),
		errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
	}

	static defaultProps = {
		children: [],
		fontAdjust: 0,
		errorOption: ERROR_OPTIONS.Hidden,
	}

	state = {
		settingsPopoverIsOpen: false,
		settingsPopoverAnchorEl: null,
	}

	setUIState = (settings) => {
		this.props.dispatch(setUIState({
			section: "SolvePuzzle",
			settings,
		}));
	}

	handleFontAdjustChange = (adjust) => {
		this.setUIState({
			fontAdjust: adjust
		});
	}

	handleFileUpload = ({ puzzle }) => {
		this.props.dispatch(addPuzzle({
			puzzle,
			setAsCurrent: true
		}));
	}

	handleFileUploadFailure = (error) => {
		console.error(error);
	}

	handlePuzzleSelected = ({ index }) => {
		this.props.dispatch(setCurrentPuzzleIndex({
			index
		}));

		this.setUIState({
			currentDirection: null,
			selectedCellPosition: null,
		});
	}

	handleInputCellSelect = ({ cell, position }) => {
		const settings = {
			selectedCellPosition: position,
		};

		if (!this.props.currentDirection) {
			settings.currentDirection = cell.getIn(["containingClues", "across"]) ?
				DIRECTIONS.Across :
				DIRECTIONS.Down;
		}
		this.setUIState(settings);
	}

	handleCellChange = ({ position, value, wasDelete }) => {
		this.props.dispatch(setPuzzleCellContent({
			puzzleIndex: this.props.currentPuzzleIndex,
			position,
			value,
		}));

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
				}
			}
		}

		if (newFocusCellPosition) {
			this.setUIState({
				selectedCellPosition: newFocusCellPosition,
			});
		}
	}

	handleErrorOptionChange = (event, value) => {
		this.setUIState({
			errorOption: value
		});
	}

	toggleDirection = ({ position }) => {
		const cell = this.props.puzzle.grid.getIn([position[1], position[0]]);

		this.setUIState({
			currentDirection: this.props.currentDirection === DIRECTIONS.Across || !cell.getIn(["containingClues", "across"]) ?
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
					targetOrigin={{horizontal: "right", vertical: "top"}}
				>
					<PuzzleSettings
						onErrorOptionChange={this.handleErrorOptionChange}
						errorOption={this.props.errorOption}
						currentFontSizeAdjust={this.props.fontAdjust}
						onFontSizeAdjustChange={this.handleFontAdjustChange}
						maxFontSizeAdjust={3}
						minFontSizeAdjust={-2}
					/>
				</Popover>
				<IconButton
					className="c_solve-puzzle--puzzle-settings-button"
					iconClassName="fa fa-gear"
					onClick={(event) => this.setState({
						settingsPopoverIsOpen: true,
						settingsPopoverAnchorEl: event.target,
					})}
				/>
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
									className="c_solve-puzzle--crossword-grid-container"
									fontAdjust={this.props.fontAdjust}
									puzzle={this.props.puzzle}
									currentDirection={this.props.currentDirection}
									onInputCellSelect={this.handleInputCellSelect}
									onCellChange={this.handleCellChange}
									selectedCellPosition={this.props.selectedCellPosition}
									toggleDirection={this.toggleDirection}
									onMoveFocus={this.handleMoveFocus}
									errorOption={this.props.errorOption}

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

export default connect(
	function mapStateToProps(state) {
		const props = {};

		const uiState = state.get("ui");

		["fontAdjust", "selectedCellPosition", "currentDirection", "errorOption"].forEach(
			(prop) => {
				if (uiState.hasIn(["SolvePuzzle", prop])) {
					props[prop] = uiState.getIn(["SolvePuzzle", prop]);
				}
			}
		);

		const puzzlesState = state.get("puzzles");
		props.existingPuzzles = puzzlesState.puzzles;
		props.currentPuzzleIndex = puzzlesState.currentPuzzleIndex;

		if (props.currentPuzzleIndex !== null) {
			props.puzzle = props.existingPuzzles.get(props.currentPuzzleIndex);
		}

		return props;
	}
)(SolvePuzzle);
