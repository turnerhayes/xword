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
import classesHelper      from "project/scripts/classes";
import                         "./SolvePuzzle.less";

const classes = classesHelper("solve-puzzle");

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
		// TODO: figure out how to handle errors
		// eslint-disable-next-line no-console
		console.error(error);
	}

	handlePuzzleSelected = ({ index }) => {
		this.props.onPuzzleSelected && this.props.onPuzzleSelected({ index });
	}

	handleInputCellSelect = ({ cell, position }) => {
		this.props.onInputCellSelect && this.props.onInputCellSelect({ cell, position, currentDirection: this.props.currentDirection });
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
				{...classes()}
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
					{...classes("puzzle-settings-button")}
					onClick={(event) => this.setState({
						settingsPopoverIsOpen: true,
						settingsPopoverAnchorEl: event.target,
					})}
				>
					<Icon
						className="icon"
					>settings</Icon>
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
							{...classes("current-clue")}
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
									{...classes("crossword-grid-container")}
									puzzle={this.props.puzzle}
									onInputCellSelect={this.handleInputCellSelect}
									onCellChange={this.handleCellChange}
									selectedCellPosition={this.props.selectedCellPosition}
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
