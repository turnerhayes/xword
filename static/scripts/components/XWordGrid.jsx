import _        from "lodash";
import React    from "react";
import ReactDOM from "react-dom";
import $        from "jquery";
import "grid.scss";

function range(max) {
	return [...Array(max).keys()];
}

function _ensureGrid(nextProps) {
	
}

class XWordGrid extends React.Component {
	state = {
		grid: null
	}

	componentWillMount() {
		if (this.props.width && this.props.height) {
			this.setState({grid: this.generateEmptyGrid(this.props.width, this.props.height)});
		}
		else if (this.props.puzzle) {
			this.setState({grid: _.cloneDeep(this.props.puzzle.grid)});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (
			(nextProps.width && nextProps.height) &&
			(nextProps.width !== this.props.width || nextProps.height !== this.props.height)
		) {
			this.setState({grid: this._generateEmptyGrid(nextProps.width, nextProps.height)});
		}
		else if (nextProps.puzzle && nextProps.puzzle.grid !== this.state.grid) {
			this.setState({grid: _.cloneDeep(nextProps.puzzle.grid)});
		}
	}

	_setCellNumbering = (grid) => {
		let clueNumber = 0;

		grid.forEach(
			(row, rowIndex) => (
				row.forEach(
					(cell, columnIndex) => {
						delete cell.clueNumber;
						let across, down;

						if (!cell.isBlockCell) {
							if (
								(
									columnIndex === 0 ||
									row[columnIndex - 1].isBlockCell
								) && (
									columnIndex + 1 < row.length &&
									!row[columnIndex + 1].isBlockCell
								)
							) {
								across = true;
							}

							if (
								(
									rowIndex === 0 ||
									grid[rowIndex - 1][columnIndex].isBlockCell
								) && (
									rowIndex + 1 < grid.length &&
									!grid[rowIndex + 1][columnIndex].isBlockCell
								)
							) {
								down = true;
							}

							if (across || down) {
								cell.clueNumber = ++clueNumber;
							}
						}
					}
				)
			)
		);

		return grid;
	}

	handleCellChange = (event) => {

	}

	handleCellClick = (event) => {
		let $cell = $(event.currentTarget);

		if (!$cell.hasClass('cell')) {
			$cell = $cell.closest('.cell');
		}

		const cellPosition = $cell.data('cell-position');

		if (event.shiftKey) {
			const grid = _.cloneDeep(this.state.grid);

			grid[cellPosition[1]][cellPosition[0]].isBlockCell = !grid[cellPosition[1]][cellPosition[0]].isBlockCell;

			this._setCellNumbering(grid);

			this.setState({grid});
		}
	}

	generateCell = (args) => {
		const properties = {
			'data-clue-number': args.clueNumber,
			'data-cell-position': JSON.stringify(args.cellPosition),
		};

		if (args.clueNumber) {
			properties['data-clue-number'] = args.clueNumber;
		}

		if (args.containingClues.across) {
			properties['data-containing-clue-across'] = args.containingClues.across;
		}

		if (args.containingClues.down) {
			properties['data-containing-clue-down'] = args.containingClues.down;
		}

		if (args.enableToggleClick) {
			properties.onClick = this.handleCellClick;
		}

		return (
			<td
				{...properties}
				key={`cell-${args.rowIndex}-${args.columnIndex}`}
				className={'cell ' + (args.isBlockCell ? 'block-cell' : 'crossword-cell')}
			>
				{!args.isBlockCell && (
				<input
					type="text"
					className="letter-input"
					onChange={this.handleCellChange}
					defaultValue={
						args.userSolution ?
							args.userSolution :
							(args.editable ? args.solution : undefined)
					}
				/>
				)}
			</td>
		);
	}

	generateEmptyGrid = (width, height) => {
		return this._setCellNumbering(
			range(height).map(
				() => range(width).map(
					() => ({})
				)
			)
		);
	}

	generatePuzzleGrid = (grid, options) => {
		return grid.map(
			(row, rowIndex) => (
				<tr className="puzzle-row" key={`row-${rowIndex}`}>
				{row.map(
					(cell, columnIndex) => this.generateCell({
						rowIndex,
						columnIndex,
						isBlockCell: cell.isBlockCell,
						clueNumber: cell.clueNumber,
						containingClues: cell.containingClues || {},
						cellPosition: [columnIndex, rowIndex],
						enableToggleClick: options.editable,
					})
				)}
				</tr>
			)
		);
	}

	render() {
		return (
			<table className="crossword-grid">
				<tbody>
					{this.generatePuzzleGrid(
						this.state.grid,
						{
							editable: this.props.editable || !this.props.puzzle
						}
					)}
				</tbody>
			</table>
		);
	}
}

export default XWordGrid;
