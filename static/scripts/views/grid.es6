"use strict";

const $        = require('jquery');
const _        = require('lodash');
const Backbone = require('backbone');

const DIRECTIONS = {
	ACROSS: 1,
	DOWN: 2
};

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

class GridView extends Backbone.View {
	get events() {
		return _events;
	}

	static get KEYCODES() {
		return KEYCODES;
	}

	static get DIRECTIONS() {
		return DIRECTIONS;
	}

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

	_toggleDirection() {
		const view = this;

		view._setDirection(
			view.direction === DIRECTIONS.ACROSS ?
				DIRECTIONS.DOWN :
				DIRECTIONS.ACROSS
		);
	}

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
	}

	_goLeft($currentCell) {
		return $currentCell.prevAll('.crossword-cell').first().find('.letter-input').focus();
	}

	_goRight($currentCell) {
		return $currentCell.nextAll('.crossword-cell').first().find('.letter-input').focus();
	}

	_goUp($currentCell) {
		return $currentCell.closest('.puzzle-row').prevAll().find(
			'.crossword-cell:nth-child(' + (
				$currentCell.index() + 1
			) + ')'
		).last().find('.letter-input').focus();
	}

	_goDown($currentCell) {
		return $currentCell.closest('.puzzle-row').nextAll().find(
			'.crossword-cell:nth-child(' + (
				$currentCell.index() + 1
			) + ')'
		).first().find('.letter-input').focus();
	}

	_goToNextCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return view._goRight($currentCell);
		}

		return view._goDown($currentCell);
	}

	_goToPreviousCell($currentCell) {
		const view = this;

		if (view.direction === DIRECTIONS.ACROSS) {
			return view._goLeft($currentCell);
		}

		return view._goUp($currentCell);
	}

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

	_highlightAcrossClue(number) {
		const view = this;

		view._clueLists.$across.find('[data-clue-number="' + number + '"]').addClass('highlighted');

		view._$grid.find('.crossword-cell[data-containing-clue-across="' + number + '"]')
			.addClass('highlighted');

		view.$el.trigger('clue-change', {
			direction: 'across',
			number: number,
		});
	}

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
	}

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
	}

	_handleCrosswordCellInput(event) {
		const view = this;
		const $cell = $(event.currentTarget);

		$cell.val($cell.val().toLocaleUpperCase());
	}

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

	_handleCrosswordCellClick(event) {
		$(event.currentTarget).find('.letter-input').focus();
	}

	_handleCrosswordCellDoubleClick() {
		const view = this;

		view._toggleDirection();
	}

	_handleClueClick(event) {
		const view = this;

		const $clue = $(event.currentTarget);

		const clueNumber = $clue.data('clue-number');
		const clueDirection = $clue.data('clue-direction');

		view._$grid.find('.crossword-cell[data-clue-number="' + clueNumber + '"]')
			.find('.letter-input').focus();

		view._setDirection(
			clueDirection === 'across' ?
				DIRECTIONS.ACROSS :
				DIRECTIONS.DOWN
		);
	}
}

exports = module.exports = GridView;
