import React                   from "react";
import PropTypes               from "prop-types";
import ImmutablePropTypes      from "react-immutable-proptypes";
import DocumentEvents          from "react-document-events";
import classnames              from "classnames";
import {
	Map,
	List,
	is
}                              from "immutable";
import { withStyles }          from "material-ui/styles";
import Button                  from "material-ui/Button";
import TextField               from "material-ui/TextField";
import Dialog, {
	DialogTitle,
	DialogContent
}                              from "material-ui/Dialog";
import {
	ImmutablePuzzle
}                              from "xpuz";
import LoadingIcon             from "project/scripts/components/LoadingIcon";
import CrosswordGrid           from "project/scripts/containers/CrosswordGrid";
import PuzzlePicker            from "project/scripts/components/PuzzlePicker";
import DictionaryLookup        from "project/scripts/containers/DictionaryLookup";
import PuzzleGeneratorControls from "project/scripts/containers/PuzzleGeneratorControls";
import {
	MINIMUM_GRID_DIMENSIONS,
	CELL_PLACEMENT_MODES,
	DIRECTIONS
}                     from "project/scripts/constants";

function range(max) {
	return [...new Array(max)];
}

function generateEmptyGrid({ width, height }) {
	return List(range(height)).map(
		() => List(range(width)).map(
			() => Map()
		)
	);
}

const styles = {
	root: {
		display: "inline-block",
	},

	hidden: {
		visibility: "hidden",
	},

	clue: {
		display: "flex",
		alignItems: "baseline",
	},

	clueInput: {
		flex: 1,
		marginLeft: "0.6em",
	},
};


class GeneratePuzzle extends React.PureComponent {
	static propTypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		puzzle: PropTypes.instanceOf(ImmutablePuzzle),
		classes: PropTypes.object,
		cellPlacementMode: PropTypes.oneOf(Object.values(CELL_PLACEMENT_MODES)),
		selectedCellPosition: ImmutablePropTypes.listOf(PropTypes.number),
		currentDirection: PropTypes.oneOf(Object.values(DIRECTIONS)),
		isDictionaryLookupDialogOpen: PropTypes.bool,
		onSetPuzzle: PropTypes.func,
		onUpdatePuzzleCell: PropTypes.func,
		onUpdateGrid: PropTypes.func,
		onCellPlacementModeChange: PropTypes.func,
		onChangeSelectedCell: PropTypes.func,
		onClueChange: PropTypes.func,
		onClearClues: PropTypes.func,
		onToggleDictionaryLookupDialogOpen: PropTypes.func,
	}

	static defaultProps = {
		width: 10,
		height: 10,
	}

	componentWillMount() {
		if (!this.props.puzzle) {
			this.setGeneratedPuzzle();
		}
	}

	componentDidMount() {
		if (!this.props.selectedCellPosition) {
			this.selectFirstInputCell();
		}
	}

	componentDidUpdate(oldProps) {
		if (!is(oldProps.puzzle, this.props.puzzle)) {
			this.selectFirstInputCell();
		}
	}

	selectFirstInputCell() {
		if (!this.props.puzzle) {
			return null;
		}

		let inputCell;
		let inputCellPosition = null;

		for (let rowIndex = 0; inputCellPosition === null && rowIndex < this.props.puzzle.grid.size; rowIndex++) {
			const row = this.props.puzzle.grid.get(rowIndex);

			for (let columnIndex = 0; inputCellPosition === null && columnIndex < row.size; columnIndex++) {
				const cell = row.get(columnIndex);

				if (!cell.get("isBlockCell")) {
					inputCellPosition = List([columnIndex, rowIndex]);
					inputCell = cell;
				}
			}
		}

		if (inputCellPosition) {
			this.handleInputCellSelect({ cell: inputCell, position: inputCellPosition });
		}
	}

	generateEmptyPuzzle = () => {
		return new ImmutablePuzzle({
			grid: generateEmptyGrid({ width: this.props.width, height: this.props.height, }),
			clues: {
				across: {},
				down: {},
			},
			info: {
				title: "",
				author: "",
			},
		});
	}

	setGeneratedPuzzle = (puzzle = this.generateEmptyPuzzle()) => {
		this.props.onSetPuzzle && this.props.onSetPuzzle({
			puzzle
		});
	}

	updatePuzzleCell = (columnIndex, rowIndex, cell) => {
		this.props.onUpdatePuzzleCell && this.props.onUpdatePuzzleCell(columnIndex, rowIndex, cell);
	}

	updateGrid = (grid) => {
		this.props.onUpdateGrid && this.props.onUpdateGrid(grid);
	}

	handleCellClick = ({ cell, position }) => {
		const shouldPlaceBlockCells = (this.props.cellPlacementMode === CELL_PLACEMENT_MODES.Blocks);

		if ((!!cell.get("isBlockCell")) !== shouldPlaceBlockCells) {
			this.updatePuzzleCell(position[0], position[1], {
				isBlockCell: shouldPlaceBlockCells,
			});
		}
	}

	handleCellContentChange = ({ position, value }) => {
		this.updatePuzzleCell(
			position[0], position[1],
			{
				solution: value,
			}
		);
	}

	handleInputCellSelect = ({ cell, position }) => {
		this.props.onChangeSelectedCell && this.props.onChangeSelectedCell({
			cell,
			position,
			currentDirection: this.props.currentDirection,
		});
	}

	handleClueTextChange = ({ clueNumber, clueText}) => {
		this.props.onClueChange && this.props.onClueChange({
			clueNumber,
			clueText,
			direction: this.props.currentDirection
		});
	}

	handleClearPuzzle = () => {
		this.updateGrid(generateEmptyGrid({
			height: this.props.height,
			width: this.props.width,
		}));

		this.props.onClearClues && this.props.onClearClues();
	}

	handlePuzzleUpload = ({ puzzle }) => {
		this.setGeneratedPuzzle(puzzle);
	}

	handleDimensionsChange = ({ width, height }) => {
		const currentHeight = this.props.puzzle.grid.size;
		const currentWidth = this.props.puzzle.grid.first().size;

		if (
			(width === currentWidth && height === currentHeight) ||
			width < MINIMUM_GRID_DIMENSIONS.width ||
			height < MINIMUM_GRID_DIMENSIONS.height
		) {
			return;
		}

		this.updateGrid(this.props.puzzle.grid.withMutations(
			(grid) => {

				if (height && height !== currentHeight) {
					if (height > currentHeight) {
						// need to add rows
						grid.push(
							List(range(width || currentWidth).map(() => Map()))
						);
					}
					else {
						// need to remove rows
						grid.slice(0, height);
					}
				}

				if (width && width !== currentWidth) {
					if (width > currentWidth) {
						// need to add cells
						grid.forEach(
							(row, index) => grid.set(index, row.push(...range(width - currentWidth).map(() => Map())))
						);
					}
					else {
						// need to remove cells
						grid.forEach(
							(row, index) => grid.set(index, row.slice(0, width))
						);
					}
				}

				return grid;
			}
		));
	}

	handleCellPlacementModeChange = ({ mode }) => {
		this.props.onCellPlacementModeChange && this.props.onCellPlacementModeChange({ mode });
	}

	toggleShouldPlaceBlockCells = () => {
		this.handleCellPlacementModeChange({
			mode: this.props.cellPlacementMode === CELL_PLACEMENT_MODES.Blocks ?
				CELL_PLACEMENT_MODES.Input :
				CELL_PLACEMENT_MODES.Blocks,
		});
	}

	toggleDictionaryLookupDialogOpen = (state) => {
		this.props.onToggleDictionaryLookupDialogOpen &&
			this.props.onToggleDictionaryLookupDialogOpen(state);
	}

	render() {
		const selectedCell = this.props.puzzle && this.props.selectedCellPosition &&
			this.props.puzzle.grid.getIn([this.props.selectedCellPosition.get(1), this.props.selectedCellPosition.get(0)]);
		const selectedClue = selectedCell && !selectedCell.get("isBlockCell") && {
			number: selectedCell.getIn(["containingClues", this.props.currentDirection]),
			text: this.props.puzzle.clues.getIn([
				this.props.currentDirection,
				selectedCell.getIn([
					"containingClues",
					this.props.currentDirection
				]).toString() // Keys in the clues map are strings
			])
		};
		const cellsInSelectedTerm = selectedCell && this.props.currentDirection && this.props.puzzle.grid.reduce(
			(count, row) => count + row.count((cell) => cell.getIn(["containingClues", this.props.currentDirection]) ===
				selectedCell.getIn(["containingClues", this.props.currentDirection])),
			0
		);

		return (
			<div
				className={`c_generate-puzzle ${this.props.classes.root}`}
			>
				<DocumentEvents
					enabled={true}
					onKeyDown={(event) => !event.repeat && event.key === "Shift" && this.toggleShouldPlaceBlockCells()}
					onKeyUp={(event) => event.key === "Shift" && this.toggleShouldPlaceBlockCells()}
				/>
				<PuzzlePicker
					onUploadSuccess={this.handlePuzzleUpload}
				/>
				{
					this.props.puzzle && (
						<PuzzleGeneratorControls
							onClearPuzzle={this.handleClearPuzzle}
							onCellPlacementModeChange={this.handleCellPlacementModeChange}
							cellPlacementMode={this.props.cellPlacementMode}
							onDimensionsChange={this.handleDimensionsChange}
							uiSection="GeneratePuzzle"
							width={this.props.width}
							height={this.props.height}
						/>
					)
				}
					<h1
						className={classnames(
							this.props.classes.clue,
							{
								[this.props.classes.hidden]: !selectedClue
							}
						)}
					>
						{
							selectedClue && `${selectedClue.number} ${this.props.currentDirection}:`
						}
						<TextField
							className={this.props.classes.clueInput}
							value={(selectedClue && selectedClue.text) || ""}
							onChange={(event) => this.handleClueTextChange({
								clueNumber: selectedClue.number,
								clueText: event.target.value,
							})}
						/>
						<Button
							onClick={() => this.toggleDictionaryLookupDialogOpen(true)}
						>
							Lookup words
						</Button>
						<Dialog
							open={this.props.isDictionaryLookupDialogOpen}
							onRequestClose={() => this.toggleDictionaryLookupDialogOpen(false)}
						>
							<DialogTitle>Lookup Words</DialogTitle>
							<DialogContent>
								<DictionaryLookup
									termLength={cellsInSelectedTerm}
								/>
							</DialogContent>
						</Dialog>
					</h1>
				{
					this.props.puzzle && (
						<CrosswordGrid
							uiSection="GeneratePuzzle"
							puzzle={this.props.puzzle}
							onCellClick={this.handleCellClick}
							onInputCellSelect={this.handleInputCellSelect}
							onCellChange={this.handleCellContentChange}
							selectedCellPosition={this.props.selectedCellPosition}
							showUserSolutions={false}
							focusSelectedCell={false}
						/>
					)
				}
				{
					!this.props.puzzle && (
						<LoadingIcon />
					)
				}
			</div>
		);
	}
}

export default withStyles(styles)(GeneratePuzzle);
