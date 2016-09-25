"use strict";

/**
 * Manages the puzzle grid (not including the clues list, etc.)
 *
 * @module views/grid
 */


/**
 * Backbone view class
 *
 * @external Backbone/View
 * @see {@link http://backbonejs.org/#View|View}
 */

/**
 * jQuery
 *
 * @external jQuery
 * @see {@link http://api.jquery.com|jQuery}
 */

import $        from "jquery";
import _        from "lodash";
import Backbone from "backbone";

/**
 * Directions for clues
 *
 * @static
 *
 * @memberOf module:views/grid~GridView
 * @enum {number}
 */
const DIRECTIONS = {
	ACROSS: 1,
	DOWN: 2
};

/**
 * Key codes
 *
 * @static
 *
 * @memberOf module:views/grid~GridView
 * @enum {number}
 */
const KEYCODES = {
	BACKSPACE: 8,
	TAB: 9,
	SPACE: 32,
	END: 35,
	HOME: 36,
	LEFT_ARROW: 37,
	UP_ARROW: 38,
	RIGHT_ARROW: 39,
	DOWN_ARROW: 40,
	DELETE: 46,
};

const _events = {
	'input .crossword-cell .letter-input': '_handleCrosswordCellInput',
	'click .crossword-cell': '_handleCrosswordCellClick',
	'dblclick .crossword-cell.highlighted': '_handleCrosswordCellDoubleClick',
	'keydown .crossword-cell': '_handleCrosswordCellKeydown',
	'keyup .crossword-cell': '_handleCrosswordCellKeyup',
	'focusin .crossword-cell .letter-input': '_handleCrosswordCellFocus'
};

/**
 * Puzzle grid view class
 *
 * @extends external:Backbone/View
 */
class GridView extends Backbone.View {
	/**
	 * Events object
	 *
	 * @type object
	 */
	get events() {
		return _events;
	}

	static get KEYCODES() {
		return KEYCODES;
	}

	static get DIRECTIONS() {
		return DIRECTIONS;
	}

	/**
	 * The current direction of the grid
	 *
	 * @memberOf module:views/grid~GridView
	 * @instance
	 * @var {module:views/grid~GridView.DIRECTIONS} direction
	 */

	/**
	 * Renders the view.
	 *
	 * @override
	 *
	 * @returns {module:views/grid~GridView} this view
	 */
	render() {
		const view = this;

		super.render(...arguments);

		view._$grid = view.$('.crossword-grid');

		view._clueLists = {
			$across: view.$('.clues-list-across'),
			$down: view.$('.clues-list-down')
		};

		view._$directionIndicator = view.$('.direction-indicator');

		view._setDirection(DIRECTIONS.ACROSS);

		return view;
	}

	/**
	 * Gets a grid of the current answers corresponding to the crossword grid.
	 *
	 * For example:
	 *	
	 *	[
	 *		['A', 'N', 'T', '#', 'U'],
	 *		['V', '#', 'Y', '#', 'P']
	 *	]
	 *
	 * '#' represents a block cell.
	 *
	 * @private
	 *
	 * @returns {Array<Array<string>>} a two-dimensional array, with one element for
	 *	each cell in the puzzle
	 */
	_getCurrentAnswers() {
		const view = this;

		const answers = _.map(
			view._$grid.find('.puzzle-row'),
			function(row) {
				return _.map(
					$(row).find('.cell'),
					function(cell) {
						const $cell = $(cell);

						if ($cell.hasClass('block-cell')) {
							return '#';
						}

						return $cell.find('.letter-input').val() || null;
					}
				);
			}
		);

		return answers;
	}

	/**
	 * Switches the active direction between {@link module:views/grid~GridView.DIRECTIONS.ACROSS|across}
	 *	and {@link module:views/grid~GridView.DIRECTIONS.DOWN|down}
	 *
	 * @private
	 */
	_toggleDirection() {
		const view = this;

		view._setDirection(
			view.direction === DIRECTIONS.ACROSS ?
				DIRECTIONS.DOWN :
				DIRECTIONS.ACROSS
		);
	}

	/**
	 * Sets the active direction to the specified {@link module:views/grid~GridView.DIRECTIONS|direction}.
	 *
	 * @private
	 *
	 * @param {module:views/grid~GridView.DIRECTIONS} direction - the direction to become active
	 *
	 * @returns {module:views/grid~GridView} this view
	 */
	_setDirection(direction) {
		const view = this;

		view.direction = direction;

		let clueNumber;
		const $focusedCell = view._$grid.find(':focus').closest('.crossword-cell');

		const $highlighted = view._$grid.add(view._clueLists.$across)
			.add(view._clueLists.$down)
			.find('.highlighted');

		if (view.direction === DIRECTIONS.ACROSS) {
			view._$directionIndicator.removeClass('down')
				.addClass('across');

			if ($focusedCell.length > 0) {
				clueNumber = $focusedCell.data('containing-clue-across');
			}

			if (!_.isUndefined(clueNumber)) {
				$highlighted.removeClass('highlighted');
				view._highlightAcrossClue(clueNumber);
			}
		}
		else if (view.direction === DIRECTIONS.DOWN) {
			view._$directionIndicator.removeClass('across')
				.addClass('down');

			if ($focusedCell.length > 0) {
				clueNumber = $focusedCell.data('containing-clue-down');
			}

			if (!_.isUndefined(clueNumber)) {
				$highlighted.removeClass('highlighted');
				view._highlightDownClue(clueNumber);
			}
		}

		return view;
	}

	/**
	 * Moves the focus to the crossword cell directly to the left of the specified cell.
	 *
	 * If there is no crossword cell to the left, either because the specified cell is
	 *	at the left edge of the puzzle or because the cell to its left is a block cell, this
	 *	focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move left
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goLeft($currentCell) {
		return $currentCell.prevAll('.crossword-cell').first().find('.letter-input').focus();
	}

	/**
	 * Moves the focus to the crossword cell directly to the right of the specified cell.
	 *
	 * If there is no crossword cell to the right, either because the specified cell is
	 *	at the right edge of the puzzle or because the cell to its right is a block cell, this
	 *	focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move right
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goRight($currentCell) {
		return $currentCell.nextAll('.crossword-cell').first().find('.letter-input').focus();
	}

	/**
	 * Moves the focus to the crossword cell directly above the specified cell.
	 *
	 * If there is no crossword cell above, either because the specified cell is
	 *	at the top edge of the puzzle or because the cell above is a block cell, this
	 *	focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move up
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goUp($currentCell) {
		return $currentCell.closest('.puzzle-row').prevAll().find(
			'.crossword-cell:nth-child(' + (
				$currentCell.index() + 1
			) + ')'
		).last().find('.letter-input').focus();
	}

	/**
	 * Moves the focus to the crossword cell directly below the specified cell.
	 *
	 * If there is no crossword cell below, either because the specified cell is
	 *	at the bottom edge of the puzzle or because the cell below is a block cell, this
	 *	focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move down
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goDown($currentCell) {
		return $currentCell.closest('.puzzle-row').nextAll().find(
			'.crossword-cell:nth-child(' + (
				$currentCell.index() + 1
			) + ')'
		).first().find('.letter-input').focus();
	}

	/**
	 * Moves the focus to the next crossword cell to the specified cell based on the active direction.
	 *
	 * If the active direction is {@link module:views/grid~GridView.DIRECTIONS.ACROSS|across}, this goes
	 * 	right, otherwise it goes down. If it can't move to the next cell, whether because the specified
	 *	cell is at an edge or because the next cell is a block cell, this focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goToNextCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return view._goRight($currentCell);
		}

		return view._goDown($currentCell);
	}

	/**
	 * Moves the focus to the previous crossword cell to the specified cell based on the active direction.
	 *
	 * If the active direction is {@link module:views/grid~GridView.DIRECTIONS.ACROSS|across}, this goes
	 * 	left, otherwise it goes up. If it can't move to the next cell, whether because the specified
	 *	cell is at an edge or because the previous cell is a block cell, this focuses the specified cell.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goToPreviousCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return view._goLeft($currentCell);
		}

		return view._goUp($currentCell);
	}

	/**
	 * Moves the focus to the first cell in the term in which the specified cell exists, based on the
	 *	active direction.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goToBeginningCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return $currentCell.prevUntil('.block-cell').add($currentCell).first().find('.letter-input').focus();
		}

		let $cells = $currentCell;

		$currentCell.closest('.puzzle-row').prevAll().each(
			function() {
				let $crosswordCell = $(this).find('.crossword-cell:nth-child(' + ($currentCell.index() + 1) + ')');

				if ($crosswordCell.length === 0) {
					return false;
				}

				$cells = $crosswordCell.add($cells);
			}
		);

		return $cells.first().find('.letter-input').focus();
	}

	/**
	 * Moves the focus to the last cell in the term in which the specified cell exists, based on the
	 *	active direction.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $currentCell - the cell from which to move
	 *
	 * @returns {external:jQuery} a jQuery object containing the input within the cell that was focused
	 */
	_goToEndingCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return $currentCell.add($currentCell.nextUntil('.block-cell')).last().find('.letter-input').focus();
		}

		let $cells = $currentCell;

		$currentCell.closest('.puzzle-row').nextAll().each(
			function() {
				let $crosswordCell =$(this).find('.crossword-cell:nth-child(' + ($currentCell.index() + 1) + ')');

				if ($crosswordCell.length === 0) {
					return false;
				}

				$cells = $cells.add($crosswordCell);
			}
		);

		return $cells.last().find('.letter-input').focus();
	}

	/**
	 * Highlights the cells for the across clue corresponding with the specified clue number (if applicable).
	 *
	 * @private
	 *
	 * @param {Number} number - the clue number to highlight
	 *
	 * @fires clue-change
	 *
	 * @returns {module:views/grid~GridView} this view
	 */
	_highlightAcrossClue(number) {
		const view = this;

		view._clueLists.$across.find('[data-clue-number="' + number + '"]').addClass('highlighted');

		view._$grid.find('.crossword-cell[data-containing-clue-across="' + number + '"]')
			.addClass('highlighted');

		view.$el.trigger('clue-change', {
			direction: 'across',
			number: number,
		});

		return view;
	}

	/**
	 * Highlights the cells for the down clue corresponding with the specified clue number (if applicable).
	 *
	 * @private
	 *
	 * @param {Number} number - the clue number to highlight
	 *
	 * @fires clue-change
	 *
	 * @returns {module:views/grid~GridView} this view
	 */
	_highlightDownClue(number) {
		const view = this;

		view._clueLists.$down.find('[data-clue-number="' + number + '"]')
			.addClass('highlighted');

		view._$grid.find('.crossword-cell[data-containing-clue-down="' + number + '"]')
			.addClass('highlighted');
		
		view.$el.trigger('clue-change', {
			direction: 'down',
			number: number,
		});

		return view;
	}

	/**
	 * Highlights the cells for the clues corresponding with the specified clue numbers (if applicable), based
	 * on the active direction.
	 *
	 * If the active direction is {@link module:views/grid~GridView.DIRECTIONS.ACROSS|across}, highlights the
	 *	clue specified in the `across` key of the parameter. Otherwise, highlights the clue specified in the
	 *	`down` key of the parameter
	 *
	 * @private
	 *
	 * @param {object} clues - the clue numbers to highlight
	 * @param {Number} clues.across - the across clue number to highlight
	 * @param {Number} clues.down - the down clue number to highlight
	 *
	 * @fires clue-change
	 *
	 * @returns {module:views/grid~GridView} this view
	 */
	_highlightClues(clues) {
		const view = this;

		view._$grid.add(view._clueLists.$across)
			.add(view._clueLists.$down).find('.highlighted').removeClass('highlighted');

		if (view.direction === DIRECTIONS.ACROSS) {
			view._highlightAcrossClue(clues.across);
		}
		else if (view.direction === DIRECTIONS.DOWN) {
			view._highlightDownClue(clues.down);
		}

		return view;
	}

	/**
	 * Handles the `input` event on a crossword cell element
	 *
	 * @param {event} event - the input event
	 */
	_handleCrosswordCellInput(event) {
		const view = this;
		const $cell = $(event.currentTarget);

		$cell.val($cell.val().toLocaleUpperCase());
	}

	/**
	 * Handles the `keyup` event on a crossword cell element
	 *
	 * @param {event} event - the keyup event
	 */
	_handleCrosswordCellKeyup(event) {
		const view = this;
		const $currentCell = $(event.currentTarget);

		if (/[a-zA-Z]/.test(String.fromCharCode(event.which))) {
			view._goToNextCell($currentCell);
		}
		else if (event.which === 8) {
			view._goToPreviousCell($currentCell);
		}
	}

	/**
	 * Handles the `keydown` event on a crossword cell element
	 *
	 * @param {event} event - the keydown event
	 */
	_handleCrosswordCellKeydown(event) {
		const view = this;
		const $currentCell = $(event.currentTarget);
		const $input = $currentCell.find('.letter-input');

		if (event.which === 229) {
			return;
		}

		switch (event.which) {
			case KEYCODES.LEFT_ARROW:
				view._goLeft($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.UP_ARROW:
				view._goUp($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.RIGHT_ARROW:
				view._goRight($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.DOWN_ARROW:
				view._goDown($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.HOME:
				view._goToBeginningCell($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.END:
				view._goToEndingCell($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.DELETE:
				$input.val('');
				return;
			case KEYCODES.TAB:
				view._goToNextCell($currentCell);
				event.preventDefault();
				return;
			case KEYCODES.SPACE:
				view._toggleDirection();
				event.preventDefault();
				return;
			case KEYCODES.BACKSPACE:
				if ($input.val() !== '') {
					$input.val('');
				}
				return;
		}

		if (/[a-zA-Z]/.test(String.fromCharCode(event.which))) {
			// Holding SHIFT while typing will allow multiple letters (some puzzles
			// include multi-letter cells)
			if (!event.shiftKey) {
				// Make sure we replace with the typed text
				$input.val('');
			}
		}
		else {
			// Not an alphabetic character--reject it
			event.preventDefault();
		}
	}

	/**
	 * Handles the `focus` event on a crossword cell element
	 *
	 * @param {event} event - the focus event
	 */
	_handleCrosswordCellFocus(event) {
		const view = this;

		const $el = $(event.currentTarget);

		const $parentCell = $el.closest('.crossword-cell');

		const containingClues = {
			across: $parentCell.data('containing-clue-across'),
			down: $parentCell.data('containing-clue-down')
		};

		view._highlightClues(containingClues);
	}

	/**
	 * Handles the `click` event on a crossword cell element
	 *
	 * @param {event} event - the click event
	 */
	_handleCrosswordCellClick(event) {
		$(event.currentTarget).find('.letter-input').focus();
	}

	/**
	 * Handles the `dblclick` event on a crossword cell element
	 *
	 * @param {event} event - the double-click event
	 */
	_handleCrosswordCellDoubleClick() {
		const view = this;

		view._toggleDirection();
	}
}

export default GridView;
