"use strict";

/**
 * Creates puzzles.
 *
 * @module views/puzzle-creator
 */

/**
 * Backbone view class
 *
 * @external Backbone/View
 * @see {@link http://backbonejs.org/#View|View}
 */

/**
 * Puzzle object class
 *
 * @external XPuz/Puzzle
 * @see {@link http://turnerhayes.github.io/xpuz/module-xpuz_puzzle-Puzzle.html|Puzzle}
 */

import $                          from "jquery";
import _                          from "lodash";
import Backbone                   from "backbone";
import PUZParser                  from "xpuz/parsers/puz";
import IPUZParser                 from "xpuz/parsers/ipuz";
import Puzzle                     from "xpuz/lib/puzzle";
import puzzleGridAndCluesTemplate from "../../templates/partials/xword-grid-and-clues.hbs";
import clueItemTemplate           from "../../templates/partials/clue-item.hbs";


const _events = {
	'submit .create-puzzle-form': '_handleFormSubmit',
	'click .cell': '_handleCellClick',
	'click .export-to-file-button': '_handleClickExportToFile',
	'change .file-upload': '_handleChangeFileUpload',
};

/**
 * Puzzle creator view class
 *
 * @extends external:Backbone/View
 */
class PuzzleCreatorView extends Backbone.View {
	/**
	 * Events object
	 *
	 * @type object
	 */
	get events() {
		return _events;
	}

	/**
	 * Initializes the view.
	 *
	 * @override
	 */
	initialize() {
		const view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);

		view._$form = view.$('.create-puzzle-form');

		view._$boardContainer = view.$('.grid-and-clues');

		view._puzParser = new PUZParser();
		view._ipuzParser = new IPUZParser();
	}

	/**
	 * Renders the view.
	 *
	 * @override
	 *
	 * @returns {module:views/puzzle-creator~PuzzleCreatorView} this view
	 */
	render() {
		const view = this;

		Backbone.View.prototype.render.apply(view, arguments);

		view._setCellNumbering();

		return view;
	}

	/**
	 * Creates a Puzzle object based on the current state of the board.
	 *
	 * @returns {external:XPuz/Puzzle} the generated puzzle
	 */
	generatePuzzleFromBoard() {
		const view = this;

		const board = _.reduce(
			view._$boardContainer.find('.puzzle-row'),
			function(board, row) {
				board.push(
					_.map(
						$(row).find('.cell'),
						function(cellElement) {
							const $cell = $(cellElement);

							if ($cell.hasClass('block-cell')) {
								return {
									isBlockCell: true
								};
							}

							return {
								clueNumber: $cell.data('clue-number'),
								solution: $cell.find('.letter-input').val()
							};
						}
					)
				);

				return board;
			},
			[]
		);

		const clues = {
			across: {},
			down: {}
		};


		const $acrossCluesList = view.$('.clues-list-across');
		const $downCluesList = view.$('.clues-list-down');

		$acrossCluesList.find('.clues-list-item').each(
			function() {
				const $item = $(this);

				clues.across[$item.data('clue-number')] = $item.find('.clue-input').val();
			}
		);

		$downCluesList.find('.clues-list-item').each(
			function() {
				const $item = $(this);

				clues.down[$item.data('clue-number')] = $item.find('.clue-input').val();
			}
		);

		return new Puzzle({
			grid: board,
			clues: clues
		});
	}

	/**
	 * Sets up the puzzle grid from the {@link external:XPuz/Puzzle} provided.
	 *
	 * @private
	 *
	 * @param {external:XPuz/Puzzle} puzzle - the puzzle from which to generate the game grid
	 *
	 * @returns {module:views/puzzle-creator~PuzzleCreatorView} this view
	 */
	_setFromPuzzle(puzzle) {
		const view = this;

		const grid = puzzleGridAndCluesTemplate({
			puzzle: puzzle,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');

		return view;
	}

	/**
	 * Defines a set of across and down clues.
	 *
	 * @typedef {object} CluesDefinition
	 *
	 * @property {object} across - across clues; keys are clue numbers, values are
	 *	objects that contain a `length` property with the length of the term
	 * @property {object} down - down clues; keys are clue numbers, values are
	 *	objects that contain a `length` property with the length of the term
	 */

	/**
	 * Sets the clue numbers on the appropriate cells.
	 *
	 * @private
	 *
	 * @returns {module:views/puzzle-filler~CluesDefinition} the new clue information
	 */
	_setCellNumbering() {
		const view = this;

		let clueNumber = 0;

		const clues = {
			across: {},
			down: {}
		};

		const $rows = view._$boardContainer.find('.puzzle-row');

		$rows.each(
			function(rowIndex) {
				const $row = $(this);
				const $cells = $row.find('.cell');

				$cells.each(
					function(columnIndex) {
						const $cell = $(this);
						let across = false;
						let down = false;

						$cell.removeAttr('data-clue-number');

						if (!$cell.hasClass('block-cell')) {
							if (
								(
									columnIndex === 0 ||
									$cells.eq(columnIndex - 1).hasClass('block-cell')
								) && (
									columnIndex + 1 < $cells.length &&
									!$cells.eq(columnIndex + 1).hasClass('block-cell')
								)
							) {
								across = true;
							}

							if (
								(
									rowIndex === 0 ||
									$rows.eq(rowIndex - 1).find('.cell').eq(columnIndex).hasClass('block-cell')
								) && (
									rowIndex + 1 < $rows.length &&
									!$rows.eq(rowIndex + 1).find('.cell').eq(columnIndex).hasClass('block-cell')
								)
							) {
								down = true;
							}

							if (across || down) {
								$cell.attr('data-clue-number', ++clueNumber);
							}

							if (across) {
								clues.across[clueNumber] = {
									length: $cell.nextUntil('.block-cell').length + 1
								};
							}

							if (down) {
								let clueLength = 1;

								$row.nextAll('.puzzle-row').each(
									function() {
										if ($(this).find('.cell').eq(columnIndex).hasClass('block-cell')) {
											return false;
										}

										clueLength++;
									}
								);

								clues.down[clueNumber] = {
									length: clueLength
								};
							}
						}
					}
				);
			}
		);

		view._updateCluesList(clues);

		return clues;
	}

	/**
	 * Updates the clues to match the current cell numbering.
	 *
	 * @private
	 *
	 * @param {module:views/puzzle-filler~CluesDefinition} cluesDefinition - an object defining the state of the clues
	 *
	 * @returns {module:views/puzzle-filler~PuzzleFillerView} this view
	 */
	_updateCluesList(cluesDefinition) {
		const view = this;

		const existingClues = {
			across: {},
			down: {}
		};

		const $acrossCluesList = view.$('.clues-list-across');
		const $downCluesList = view.$('.clues-list-down');

		$acrossCluesList.find('.clues-list-item').each(
			function() {
				const $clueItem = $(this);

				const clueText = $clueItem.find('.clue-input').val();

				if (clueText) {
					existingClues.across[$clueItem.attr('value')] = clueText;
				}
			}
		);

		$downCluesList.find('.clues-list-item').each(
			function() {
				const $clueItem = $(this);

				const clueText = $clueItem.find('.clue-input').val();

				if (clueText) {
					existingClues.down[$clueItem.attr('value')] = clueText;
				}
			}
		);

		const acrossClues = _.map(
			cluesDefinition.across,
			function(clueDefinition, clueNumber) {
				return clueItemTemplate({
					clueNumber: clueNumber,
					direction: 'across',
					editable: true
				});
			}
		).join('');

		const downClues = _.map(
			cluesDefinition.down,
			function(clueDefinition, clueNumber) {
				return clueItemTemplate({
					clueNumber: clueNumber,
					direction: 'down',
					editable: true
				});
			}
		).join('');


		$acrossCluesList.html(acrossClues);
		$downCluesList.html(downClues);
	}

	/**
	 * Handles the `submit` event on the puzzle definition form.
	 *
	 * @private
	 *
	 * @param {event} event - the submit event
	 */
	_handleFormSubmit(event) {
		const view = this;

		event.preventDefault();

		const width = parseInt(view._$form.find('[name="width"]').val(), 10);
		const height = parseInt(view._$form.find('[name="height"]').val(), 10);

		const grid = puzzleGridAndCluesTemplate({
			width: width,
			height: height,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');
	}

	/**
	 * Handles a click of a crossword cell.
	 *
	 * @private
	 *
	 * @param {event} event - the click event
	 */
	_handleCellClick(event) {
		const view = this;

		const $cell = $(event.currentTarget);

		if (event.shiftKey) {
			$cell.toggleClass('block-cell crossword-cell');

			view._setCellNumbering();
		}
	}

	/**
	 * Handles a click of the button that exports the current puzzle to a file.
	 *
	 * @private
	 */
	_handleClickExportToFile() {
		const view = this;

		const puzzle = view.generatePuzzleFromBoard();

		const puzzleBuffer = view._puzParser.generate(puzzle);

		const blob = new Blob([puzzleBuffer]);

		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');

		link.setAttribute('href', url);

		link.setAttribute('download', 'puzzle.puz');

		link.click();
	}

	/**
	 * Handles a change of the file upload control.
	 *
	 * @private
	 *
	 * @param {event} event - the change event
	 */
	_handleChangeFileUpload(event) {
		const view = this;

		const file = event.currentTarget.files[0];

		if (!file) {
			return;
		}

		const fr = new FileReader();

		fr.onload = function(event) {
			view._puzParser.parse(event.target.result).done(
				function(puzzle) {
					console.log(puzzle);

					view._setFromPuzzle(puzzle);
				}
			);
		};

		fr.readAsArrayBuffer(file);
	}
}

export default PuzzleCreatorView;
