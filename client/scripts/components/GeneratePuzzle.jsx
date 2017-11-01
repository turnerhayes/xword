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

function generateEmptyPuzzle({ width, height }) {
	return new ImmutablePuzzle({
		grid: generateEmptyGrid({ width, height }),
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

	handleCellClick = ({ event, cell, position }) => {
		if (event.shiftKey) {
			this.updatePuzzleCell(position[0], position[1], {
				isBlockCell: !cell.isBlockCell,
			});
		}
	}

	handleClearPuzzle = () => {
		this.updateGrid(generateEmptyGrid({
			height: this.props.puzzle.grid.size,
			width: this.props.puzzle.grid.get(0).size,
		}));
	}

	render() {
		return (
			<div
				className="c_generate-puzzle"
			>
				{
					this.props.puzzle && (
						<PuzzleGeneratorControls
							onClearPuzzle={this.handleClearPuzzle}
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
			else {
				props.puzzle = generateEmptyPuzzle({
					width: GeneratePuzzle.defaultProps.width,
					height: GeneratePuzzle.defaultProps.height,
				});
			}
		}

		return props;
	}
)(GeneratePuzzle);
