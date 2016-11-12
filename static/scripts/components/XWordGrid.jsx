import React    from "react";
import ReactDOM from "react-dom";
import $        from "jquery";
import "grid.scss";

function range(max) {
	return [...Array(max).keys()];
}

class XWordGrid extends React.Component {
	state = {
		grid: null
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
									row[columnIndex + 1].isBlockCell
								)
							) {
								across = true;
							}

							if (
								(
									rowIndex === 0 ||
									grid[rowIndex - 1][columnIndex].isBlockCell
								) && (
									rowIndex + 1 < this.props.grid.length &&
									grid[rowIndex + 1][columnIndex].isBlockCell
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
			const grid = JSON.parse(JSON.stringify(this.props.grid));

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
		return range(height).map(
			() => range(width).map(
				() => ({})
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
						this.props.puzzle ?
							this.props.puzzle.grid :
							this.generateEmptyGrid(this.props.width, this.props.height),
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
