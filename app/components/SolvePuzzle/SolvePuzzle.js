import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import classnames         from "classnames";
import Popover            from "@material-ui/core/Popover";
import IconButton         from "@material-ui/core/IconButton";
import Icon               from "@material-ui/core/Icon";
import { withStyles }     from "@material-ui/core/styles";
import {
	Puzzle
}                         from "xpuz/immutable";
import CrosswordGrid      from "@app/containers/CrosswordGrid";
import CrosswordClues     from "@app/components/CrosswordClues";
import PuzzlePicker       from "@app/components/PuzzlePicker";
import PuzzleSettings     from "@app/containers/PuzzleSettings";
import {
	DIRECTIONS
}                         from "@app/constants";

const styles = {
	root: {
		padding: "1em",
	},

	puzzleSettingsButton: {
		float: "right",
	},

	currentClue: {
		fontSize: "2em",
	},

	currentCluePart: {
		display: "inline-block",
	},

	currentClueNumber: {
		fontWeight: "bold",
	},

	currentClueText: {
		marginLeft: "0.5em",
	},
};

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
		classes: PropTypes.object.isRequired,
		puzzle: PropTypes.instanceOf(Puzzle),
		existingPuzzles: ImmutablePropTypes.listOf(PropTypes.instanceOf(Puzzle)),
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

	handleCellChange = ({ position, value }) => {
		this.props.setPuzzleCellContent({
			puzzleIndex: this.props.currentPuzzleIndex,
			position,
			value,
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
		const {
			classes,
			puzzle,
			selectedCellPosition,
			currentDirection
		} = this.props;

		const selectedCell = puzzle && selectedCellPosition &&
			puzzle.grid.getIn(selectedCellPosition.reverse());
		const selectedClue = selectedCell && {
			number: selectedCell.getIn(["containingClues", currentDirection]),
			text: puzzle.clues.getIn([
				currentDirection,
				selectedCell.getIn([
					"containingClues",
					currentDirection
				])
			])
		};

		return (
			<div
				className={classes.root}
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
					className={classes.puzzleSettingsButton}
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
							className={classes.currentClue}
						>
							<dt
								className={classnames(
									classes.currentCluePart,
									classes.currentClueNumber
								)}
							>
								{selectedClue.number} {capitalize(this.props.currentDirection)}:
							</dt>
							<dd
								className={classnames(
									classes.currentCluePart,
									classes.currentClueText
								)}
							>
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

export default withStyles(styles)(SolvePuzzle);
