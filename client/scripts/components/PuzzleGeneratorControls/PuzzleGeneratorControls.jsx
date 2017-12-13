import React          from "react";
import PropTypes      from "prop-types";
import Toolbar        from "material-ui/Toolbar";
import Icon           from "material-ui/Icon";
import IconButton     from "material-ui/IconButton";
import Button         from "material-ui/Button";
import TextField      from "material-ui/TextField";
import {
	GRID_DIMENSIONS,
	MINIMUM_GRID_DIMENSIONS,
	CELL_PLACEMENT_MODES,
	DIRECTIONS
}                     from "project/scripts/constants";
import classHelper    from "project/scripts/classes";
import                     "./PuzzleGeneratorControls.less";

const classes = classHelper("puzzle-generator-controls");

const placementModeConfig = {
	[CELL_PLACEMENT_MODES.Blocks]: {
		icon: "input square",
		label: "Place block cells",
	},
	[CELL_PLACEMENT_MODES.Input]: {
		icon: "block square",
		label: "Remove block cells",
	},
};

class PuzzleGeneratorControls extends React.PureComponent {
	static propTypes = {
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
		this.props.onDirectionChange && this.props.onDirectionChange({
			direction: currentDirection === DIRECTIONS.Across ?
				DIRECTIONS.Down :
				DIRECTIONS.Across,
		});
	}

	render() {
		const {
			onClearPuzzle,
			cellPlacementMode,
			uiWidth,
			uiHeight,
			currentDirection,
			width,
			height,
			onDimensionsChange,
		} = this.props;

		return (
			<Toolbar
				{...classes()}
			>
				{
					onClearPuzzle && (
						<IconButton
							onClick={() => onClearPuzzle()}
						>
							<Icon
								title="Clear puzzle"
								className="icon"
							>clear puzzle</Icon>
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
				>
					<Icon
						className="icon"
					>{placementModeConfig[cellPlacementMode].icon}</Icon>
				</IconButton>
				<IconButton
					title={`Current Direction: ${currentDirection}`}
					onClick={() => this.handleDirectionClick({
						currentDirection
					})}
				>
					<Icon
						className="icon"
					>{currentDirection}</Icon>
				</IconButton>
				<div
					{...classes("dimension-controls")}
				>
					<TextField
						required
						error={!!this.state.widthInputError}
						{...classes("dimension-input")}
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
						{...classes("dimension-input")}
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

export default PuzzleGeneratorControls;
