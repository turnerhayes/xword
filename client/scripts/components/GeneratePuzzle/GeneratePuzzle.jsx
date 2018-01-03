import React                   from "react";
import PropTypes               from "prop-types";
import ImmutablePropTypes      from "react-immutable-proptypes";
import DocumentEvents          from "react-document-events";
import classnames              from "classnames";
import {
	Map,
	List,
}                              from "immutable";
import { withStyles }          from "material-ui/styles";
import Button                  from "material-ui/Button";
import TextField               from "material-ui/TextField";
import {
	ImmutablePuzzle
}                              from "xpuz";
import LoadingIcon             from "project/scripts/components/LoadingIcon";
import CrosswordGrid           from "project/scripts/containers/CrosswordGrid";
import PuzzlePicker            from "project/scripts/components/PuzzlePicker";
import DictionaryLookupDialog  from "project/scripts/containers/DictionaryLookupDialog";
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

	componentDidUpdate() {
		const selectedCell = this.props.selectedCellPosition &&
			this.props.puzzle.grid.getIn(this.props.selectedCellPosition.reverse());

		if (
			this.props.selectedCellPosition &&
			(!selectedCell || selectedCell.get("isBlockCell"))
		) {
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
			this.props.onChangeSelectedCell && this.props.onChangeSelectedCell({
				position: null,
			});
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

	handleDictionaryResultChosen = ({ term, clue }) => {
		this.toggleDictionaryLookupDialogOpen(false);

		const {
			puzzle,
			selectedCellPosition,
			currentDirection,
		} = this.props;

		const selectedCell = puzzle.grid.getIn(selectedCellPosition.reverse());

		const clueNumber = selectedCell.getIn(["containingClues", currentDirection]);

		let termIndex = 0;

		this.handleClueTextChange({
			clueNumber,
			clueText: clue,
		});

		this.updateGrid(this.props.puzzle.grid.withMutations(
			(grid) => {
				let isFinished = false;

				grid.forEach(
					(row, rowIndex) => {
						grid.set(rowIndex, row.map(
							(cell) => {
								if (isFinished || cell.getIn(["containingClues", currentDirection]) !== clueNumber) {
									return cell;
								}

								cell = cell.set("solution", term[termIndex++]);

								if (termIndex === term.length) {
									isFinished = true;
								}

								return cell;
							}
						));
					}
				);

				return grid;
			}
		));
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
			this.props.puzzle.grid.getIn(this.props.selectedCellPosition.reverse());
		
		// If a cell was just made into a block cell, then the highlighted clue direction may no longer be valid
		// (for example, the highlighted clue has two cells across, then you make one of the cells a block cell;
		// now there is no valid across clue, because clues must be more than one cell wide)
		const directionClueNumber = selectedCell && !selectedCell.get("isBlockCell") && selectedCell.getIn([
			"containingClues",
			this.props.currentDirection,
		]);

		const selectedClue = directionClueNumber && {
			number: selectedCell.getIn(["containingClues", this.props.currentDirection]),
			text: this.props.puzzle.clues.getIn([
				this.props.currentDirection,
				directionClueNumber.toString() // Keys in the clues map are strings
			])
		};

		const cellsInSelectedTerm = selectedCell && this.props.currentDirection && this.props.puzzle.grid.reduce(
			(cells, row) => cells.concat(row.filter(
				(cell) => cell.getIn(["containingClues", this.props.currentDirection]) ===
					selectedCell.getIn(["containingClues", this.props.currentDirection]))
				),
			List()
		);

		return (
			<div
				className={`c_generate-puzzle ${this.props.classes.root}`}
			>
				<DocumentEvents
					enabled={!this.props.isDictionaryLookupDialogOpen}
					onKeyDown={(event) => !event.repeat && event.key === "Shift" && this.toggleShouldPlaceBlockCells()}
					onKeyUp={(event) => event.key === "Shift" && this.toggleShouldPlaceBlockCells()}
				/>
				<PuzzlePicker
					onUploadSuccess={this.handlePuzzleUpload}
				/>
				{
					this.props.puzzle && (
						<PuzzleGeneratorControls
							puzzle={this.props.puzzle}
							selectedCellPosition={this.props.selectedCellPosition}
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
						{
							cellsInSelectedTerm && (
								<div>
									<Button
										onClick={() => this.toggleDictionaryLookupDialogOpen(true)}
									>
										Lookup words
									</Button>
									<DictionaryLookupDialog
										uiSection="GeneratePuzzle"
										onResultChosen={this.handleDictionaryResultChosen}
										currentFill={cellsInSelectedTerm.map(
											(cell) => cell.get("solution") || ""
										)}
									/>
								</div>
							)
						}
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
