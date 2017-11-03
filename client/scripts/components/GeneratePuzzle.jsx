import React                   from "react";
import PropTypes               from "prop-types";
import {
	connect
}                              from "react-redux";
import {
	Map,
	List
}                              from "immutable";
import {
	ImmutablePuzzle
}                              from "xpuz";
import CrosswordGrid           from "project/scripts/components/CrosswordGrid";
import PuzzleGeneratorControls from "project/scripts/components/PuzzleGeneratorControls";
import {
	setGeneratedPuzzle,
	updateGeneratedPuzzleCell,
	updateGeneratedPuzzleGrid
}                              from "project/scripts/redux/actions";

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


class GeneratePuzzle extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		puzzle: PropTypes.instanceOf(ImmutablePuzzle),
	}

	static defaultProps = {
		width: 10,
		height: 10,
	}

	state = {
		shouldPlaceBlocks: false,
	}

	componentWillMount() {
		if (!this.props.puzzle) {
			this.setGeneratedPuzzle();
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

	setGeneratedPuzzle = () => {
		const puzzle = this.generateEmptyPuzzle();

		this.props.dispatch(setGeneratedPuzzle({
			puzzle
		}));
	}

	updatePuzzleCell = (columnIndex, rowIndex, cell) => {
		this.props.dispatch(updateGeneratedPuzzleCell({
			columnIndex,
			rowIndex,
			cell
		}));
	}

	updateGrid = (grid) => {
		this.props.dispatch(updateGeneratedPuzzleGrid({
			grid
		}));
	}

	handleCellClick = ({ cell, position }) => {
		if (cell.get("isBlockCell") !== this.state.shouldPlaceBlocks) {
			this.updatePuzzleCell(position[0], position[1], {
				isBlockCell: this.state.shouldPlaceBlocks,
			});
		}
	}

	handleClearPuzzle = () => {
		this.updateGrid(generateEmptyGrid({
			height: this.props.puzzle.grid.size,
			width: this.props.puzzle.grid.get(0).size,
		}));
	}

	toggleShouldPlaceBlocks = () => {
		this.setState({ shouldPlaceBlocks: !this.state.shouldPlaceBlocks });
	}

	render() {
		return (
			<div
				className="c_generate-puzzle"
				onKeyDown={(event) => !event.repeat && event.key === "Shift" && this.toggleShouldPlaceBlocks()}
				onKeyUp={(event) => event.key === "Shift" && this.toggleShouldPlaceBlocks()}
			>
				{
					this.props.puzzle && (
						<PuzzleGeneratorControls
							onClearPuzzle={this.handleClearPuzzle}
							onShouldPlaceBlocksChange={() => this.toggleShouldPlaceBlocks()}
							shouldPlaceBlocks={this.state.shouldPlaceBlocks}
						/>
					)
				}
				{
					this.props.puzzle && (
						<CrosswordGrid
							puzzle={this.props.puzzle}
							onCellClick={this.handleCellClick}
						/>
					)
				}
				{
					!this.props.puzzle && (
						<span
							className="fa fa-spinner fa-spin"
						/>
					)
				}
			</div>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const props = {};

		const puzzlesState = state.get("puzzles");

		if (puzzlesState.isRehydrated) {
			if (puzzlesState.generatedPuzzle) {
				props.puzzle = puzzlesState.generatedPuzzle;
			}
		}

		return props;
	}
)(GeneratePuzzle);
