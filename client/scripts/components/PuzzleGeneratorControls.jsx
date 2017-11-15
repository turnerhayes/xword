import React          from "react";
import PropTypes      from "prop-types";
import Toolbar        from "material-ui/Toolbar";
import Icon           from "material-ui/Icon";
import IconButton     from "material-ui/IconButton";
import Button         from "material-ui/Button";
import TextField      from "material-ui/TextField";
import { withStyles } from "material-ui/styles";
import {
	GRID_DIMENSIONS,
	MINIMUM_GRID_DIMENSIONS,
	CELL_PLACEMENT_MODES
}                     from "project/scripts/constants";

const styles = {
	dimensionInput: {
		width: "3em",
	},
	right: {
		marginLeft: "auto",
	},
};

const placementModeConfig = {
	[CELL_PLACEMENT_MODES.Blocks]: {
		icon: "fa-square",
		label: "Place block cells",
	},
	[CELL_PLACEMENT_MODES.Input]: {
		icon: "fa-square-o",
		label: "Remove block cells",
	},
};

class PuzzleGeneratorControls extends React.PureComponent {
	static propTypes = {
		onClearPuzzle: PropTypes.func,
		onCellPlacementModeChange: PropTypes.func,
		onDimensionChange: PropTypes.func,
		onDimensionsChange: PropTypes.func,
		cellPlacementMode: PropTypes.oneOf(Object.values(CELL_PLACEMENT_MODES)),
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		uiWidth: PropTypes.number,
		uiHeight: PropTypes.number,
		classes: PropTypes.object,
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

	render() {
		return (
			<Toolbar
				className="c_puzzle-generator-controls"
			>
				{
					this.props.onClearPuzzle && (
						<IconButton
							onClick={() => this.props.onClearPuzzle()}
						>
							<Icon
								title="Clear puzzle"
								className="fa fa-eraser"
							/>
						</IconButton>
					)
				}
				{
					this.props.cellPlacementMode && (
							<IconButton
								title={placementModeConfig[this.props.cellPlacementMode].label}
								onClick={() => this.handleCellPlacementModeOptionClick({
									mode: this.props.cellPlacementMode === CELL_PLACEMENT_MODES.Blocks ?
										CELL_PLACEMENT_MODES.Input :
										CELL_PLACEMENT_MODES.Blocks,
								})}
							>
								<Icon
									className={`fa ${placementModeConfig[this.props.cellPlacementMode].icon}`}
								/>
							</IconButton>
					)
				}
				<div
					className={this.props.classes.right}
				>
					<TextField
						required
						error={!!this.state.widthInputError}
						className={this.props.classes.dimensionInput}
						type="number"
						name="puzzle-width"
						placeholder="Width"
						value={this.props.uiWidth || ""}
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
						className={this.props.classes.dimensionInput}
						type="number"
						name="puzzle-height"
						placeholder="Height"
						value={this.props.uiHeight || ""}
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
							this.props.uiWidth === this.props.width &&
							this.props.uiHeight === this.props.height
						}
						onClick={() => this.props.onDimensionsChange &&
							this.props.onDimensionsChange({ width: this.props.uiWidth, height: this.props.uiHeight })}
					>
						Change
					</Button>
				</div>
			</Toolbar>
		);
	}
}

export default withStyles(styles)(PuzzleGeneratorControls);
