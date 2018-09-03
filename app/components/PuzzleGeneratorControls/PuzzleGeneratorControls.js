import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { withStyles }     from "@material-ui/core/styles";
import Toolbar            from "@material-ui/core/Toolbar";
import IconButton         from "@material-ui/core/IconButton";
import Button             from "@material-ui/core/Button";
import TextField          from "@material-ui/core/TextField";
import {
	Puzzle
}                         from "xpuz/immutable";
import {
	GRID_DIMENSIONS,
	MINIMUM_GRID_DIMENSIONS,
	CELL_PLACEMENT_MODES,
	DIRECTIONS
}                         from "@app/constants";

const styles = {
	root: {
		marginTop: "2em",
	},

	dimensionControls: {
		marginLeft: "auto",
	},

	dimensionInput: {
		width: "3em",
	},
};

const placementModeConfig = {
	[CELL_PLACEMENT_MODES.Blocks]: {
		icon: "block square",
		label: "Place block cells",
	},
	[CELL_PLACEMENT_MODES.Input]: {
		icon: "input square",
		label: "Remove block cells",
	},
};

class PuzzleGeneratorControls extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		puzzle: PropTypes.instanceOf(Puzzle).isRequired,
		selectedCellPosition: ImmutablePropTypes.listOf(Number),
		onClearPuzzle: PropTypes.func,
		onCellPlacementModeChange: PropTypes.func,
		onDirectionChange: PropTypes.func,
		onDimensionChange: PropTypes.func,
		onDimensionsChange: PropTypes.func,
		cellPlacementMode: PropTypes.oneOf(Object.values(CELL_PLACEMENT_MODES)).isRequired,
		currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)).isRequired,
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		uiWidth: PropTypes.number,
		uiHeight: PropTypes.number,
	}

	state = {
		widthInputError: null,
		heightInputError: null,
	}

	handleDimensionChange = ({ event, dimension }) => {
		this.props.onDimensionChange && this.props.onDimensionChange({
			dimension,
			value: event.target.valueAsNumber || undefined
		});

		let error;

		if (!event.target.checkValidity()) {
			error = event.target.validationMessage;
		}

		this.setState({
			[`${dimension}InputError`]: error,
		});
	}

	handleCellPlacementModeOptionClick = ({ mode }) => {
		this.props.onCellPlacementModeChange && this.props.onCellPlacementModeChange({ mode });
	}

	handleDirectionClick = ({ currentDirection }) => {
		const nextDirection = currentDirection === DIRECTIONS.Across ?
			DIRECTIONS.Down :
			DIRECTIONS.Across;

		const selectedCell = this.props.selectedCellPosition &&
			this.props.puzzle.grid.getIn(this.props.selectedCellPosition.reverse());

		if (
			// If there is no selected cell, we can change the direction
			!selectedCell ||
			// Otherwise, we can only switch direction if there is a clue
			// for the desired direction 
			!!selectedCell.getIn(["containingClues", nextDirection])
		) {
			this.props.onDirectionChange && this.props.onDirectionChange({
				direction: nextDirection,
			});
		}

	}

	render() {
		const {
			classes,
			puzzle,
			selectedCellPosition,
			onClearPuzzle,
			cellPlacementMode,
			uiWidth,
			uiHeight,
			currentDirection,
			width,
			height,
			onDimensionsChange,
		} = this.props;

		const selectedCell = selectedCellPosition &&
			puzzle.grid.getIn(selectedCellPosition.reverse());

		const otherDirection = currentDirection === DIRECTIONS.Across ?
			DIRECTIONS.Down :
			DIRECTIONS.Across;

		const canChangeDirection = !selectedCell || !!selectedCell.getIn(
			["containingClues", otherDirection]
		);

		return (
			<Toolbar
				className={classes.root}
			>
				{
					onClearPuzzle && (
						<IconButton
							onClick={() => onClearPuzzle()}
							title="Clear puzzle"
							className="icon"
							disableRipple
						>
							clear puzzle
						</IconButton>
					)
				}
				<IconButton
					title={placementModeConfig[cellPlacementMode].label}
					onClick={() => this.handleCellPlacementModeOptionClick({
						mode: cellPlacementMode === CELL_PLACEMENT_MODES.Blocks ?
							CELL_PLACEMENT_MODES.Input :
							CELL_PLACEMENT_MODES.Blocks,
					})}
					className="icon"
					disableRipple
				>
					{placementModeConfig[cellPlacementMode].icon}
				</IconButton>
				<IconButton
					title={`Current Direction: ${currentDirection}`}
					onClick={() => this.handleDirectionClick({
						currentDirection,
					})}
					disabled={!canChangeDirection}
					className="icon"
					disableRipple
				>
					{currentDirection}
				</IconButton>
				<div
					className={classes.dimensionControls}
				>
					<TextField
						required
						error={!!this.state.widthInputError}
						className={classes.dimensionInput}
						type="number"
						name="puzzle-width"
						placeholder="Width"
						value={uiWidth || ""}
						inputProps={{
							min: MINIMUM_GRID_DIMENSIONS[GRID_DIMENSIONS.Width]
						}}
						onChange={(event) => this.handleDimensionChange({
							event,
							dimension: GRID_DIMENSIONS.Width,
						})}
					/> x <TextField
						required
						error={!!this.state.heightInputError}
						className={classes.dimensionInput}
						type="number"
						name="puzzle-height"
						placeholder="Height"
						value={uiHeight || ""}
						inputProps={{
							min: MINIMUM_GRID_DIMENSIONS[GRID_DIMENSIONS.Height]
						}}
						onChange={(event) => this.handleDimensionChange({
							event,
							dimension: GRID_DIMENSIONS.Height,
						})}
					/>

					<Button
						disabled={
							uiWidth === width &&
							uiHeight === height
						}
						onClick={() => onDimensionsChange &&
							onDimensionsChange({ width: uiWidth, height: uiHeight })}
					>
						Change
					</Button>
				</div>
			</Toolbar>
		);
	}
}

export default withStyles(styles)(PuzzleGeneratorControls);
