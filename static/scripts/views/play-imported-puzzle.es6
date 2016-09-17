"use strict";

import $                          from "jquery";
import _                          from "lodash";
import Backbone                   from "backbone";
import Base64ArrayBuffer          from "base64-arraybuffer";
import XPuz                       from "xpuz";
import puzzleGridAndCluesTemplate from "../../templates/partials/xword-grid-and-clues.hbs";
import puzzleStatusDialogTemplate from "../../templates/partials/modals/puzzle-status-dialog.hbs";

const PUZZLE_STORAGE_KEY = 'IMPORTED_PUZZLE';

const PUZZLE_TIMER_STORAGE_KEY = 'PUZZLE_TIMER_VALUE';

let hiddenPropertyName, visibilityChangeEventName; 

if (!_.isUndefined(document.hidden)) { // Opera 12.10 and Firefox 18 and later support 
	hiddenPropertyName = "hidden";
	visibilityChangeEventName = "visibilitychange";
}
else if (!_.isUndefined(document.mozHidden)) {
	hiddenPropertyName = "mozHidden";
	visibilityChangeEventName = "mozvisibilitychange";
}
else if (!_.isUndefined(document.msHidden)) {
	hiddenPropertyName = "msHidden";
	visibilityChangeEventName = "msvisibilitychange";
}
else if (!_.isUndefined(document.webkitHidden)) {
	hiddenPropertyName = "webkitHidden";
	visibilityChangeEventName = "webkitvisibilitychange";
}

const _events = {
	'change [name="import-puzzle-picker"]': '_handlePuzzleFileSelect',
	'input .crossword .crossword-cell': '_handleSolutionChange',
	'clue-change': '_handleClueChange'
};

class PlayImportedPuzzleView extends Backbone.View {
	get events() {
		return _events;
	}

	initialize() {
		const view = this;

		super.initialize(...arguments);

		view._puzParser = new XPuz.PUZ();

		view._namespace = 'play-imported-puzzle-view-' + view.cid;

		view._boundRequestAnimationFrame = _.bind(view._handleRequestAnimationFrame, view);
	}

	render() {
		const view = this;

		super.render(...arguments);

		view._$boardContainer = view.$('.grid-and-clues');

		view._$grid = view.$('.crossword-grid');

		view._$crossword = view.$('.crossword');

		view._$filePicker = view.$('[name="import-puzzle-picker"]');

		view._$currentClueContainer = view.$('.current-clue-container');

		view._$timerDisplay = view.$('.timer-display');

		let existingPuzzle = window.localStorage.getItem(PUZZLE_STORAGE_KEY);

		if (!_.isNull(existingPuzzle)) {
			view._puzParser.parse(Base64ArrayBuffer.decode(existingPuzzle)).done(
				function(puzzle) {
					view._setFromPuzzle(puzzle);
					view._toggleDisplay();
				}
			);
		}

		view._attachEventListeners();

		view._updateTimerDisplay();

		return view;
	}

	remove() {
		const view = this;

		view._detachEventListeners();

		return super.remove(...arguments);
	}

	_attachEventListeners() {
		const view = this;

		$(document).on('keyup.' + view._namespace, function(event) {
			if (
				event.which === 13 && // Enter
				event.shiftKey &&
				event.ctrlKey
			) {
				view._checkPuzzle();
			}
		}).on(visibilityChangeEventName + '.' + view._namespace, function(event) {
			if (document[hiddenPropertyName]) {
				view._stopTimer();
			}
			else {
				view._startTimer();
			}
		});

		$(window).on('beforeunload.' + view._namespace, function() {
			view._stopTimer();
		});

		window.requestAnimationFrame(view._boundRequestAnimationFrame);
	}

	_detachEventListeners() {
		const view = this;

		$(document).off('.' + view._namespace);

		$(window).off('.' + view._namespace);
	}

	_startTimer() {
		const view = this;

		if (view._timerRunning) {
			return;
		}

		view._timerRunning = true;
		view._lastTimerStart = Date.now();
	}

	_stopTimer() {
		const view = this;

		if (!view._timerRunning) {
			return;
		}

		view._timerRunning = false;
		view._storedTimerValue = Number(window.localStorage.getItem(PUZZLE_TIMER_STORAGE_KEY) || 0) + (Date.now() - view._lastTimerStart);
		window.localStorage.setItem(
			PUZZLE_TIMER_STORAGE_KEY,
			view._storedTimerValue
		);
	}

	_updateTimerDisplay(numMilliseconds) {
		const view = this;

		if (_.isUndefined(numMilliseconds)) {
			numMilliseconds = view._storedTimerValue || 0;
		}

		// Truncate to integer
		let numSeconds = Math.floor(numMilliseconds / 1000);

		let numMinutes = Math.floor(numSeconds / 60);

		numSeconds = (numSeconds - (60 * numMinutes)) % 60;

		if (numMinutes < 10) {
			numMinutes = '0' + numMinutes;
		}

		if (numSeconds < 10) {
			numSeconds = '0' + numSeconds;
		}

		let display = numMinutes + ':' + numSeconds;

		if (display !== view._$timerDisplay.text()) {
			view._$timerDisplay.text(display);
		}
	}

	_toggleDisplay() {
		const view = this;

		view._$crossword.toggleClass('hidden');
		view._$filePicker.toggleClass('hidden');
	}

	_checkPuzzle() {
		const view = this;

		let correctCells = view._numberOfCrosswordCells;

		view._$boardContainer.find('.puzzle-row').each(
			function(rowIndex) {
				$(this).find('.cell').each(
					function(columnIndex) {
						const $cell = $(this);

						if ($cell.hasClass('.block-cell')) {
							return;
						}

						if ($cell.find('.letter-input').val() !== view._puzzle.grid[rowIndex][columnIndex].solution) {
							$cell.addClass('error');
							correctCells -= 1;
							return;
						}

						$cell.removeClass('error');
					}
				);
			}
		);

		$(puzzleStatusDialogTemplate({
			totalNumberOfCells: view._numberOfCrosswordCells,
			numberOfCorrectCells: correctCells,
		})).modal();
	}

	_setFromPuzzle(puzzle) {
		const view = this;

		view._puzzle = puzzle;

		const grid = puzzleGridAndCluesTemplate({
			puzzle: puzzle,
			editable: false,
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');

		view._numberOfCrosswordCells = view._$boardContainer.find('.crossword-cell').length;

		if (!hiddenPropertyName || !document[hiddenPropertyName]) {
			view._startTimer();
		}

		view._storedTimerValue = Number(window.localStorage.getItem(PUZZLE_TIMER_STORAGE_KEY) || 0);
	}

	_updateStoredPuzzle(updateSolution) {
		const view = this;

		if (updateSolution) {
			view._$boardContainer.find('.puzzle-row').each(
				function(rowIndex) {
					const $cells = $(this).find('.cell');

					$cells.each(
						function(columnIndex) {
							const $cell = $(this);

							if (!$cell.hasClass('block-cell')) {
								view._puzzle.userSolution[rowIndex][columnIndex] = $cell.find('.letter-input').val();
							}
						}
					);
				}
			);

			window.localStorage.setItem(
				PUZZLE_STORAGE_KEY,
				Base64ArrayBuffer.encode(
					view._puzParser.generate(view._puzzle)
				)
			);
		}
	}

	_handleRequestAnimationFrame(timestamp) {
		const view = this;

		if (view._timerRunning) {
			view._updateTimerDisplay((view._storedTimerValue || 0) + (Date.now() - view._lastTimerStart));
		}

		window.requestAnimationFrame(view._boundRequestAnimationFrame);
	}

	_handlePuzzleFileSelect(event) {
		const view = this;

		const $filePicker = $(event.target);

		const file = $filePicker.get(0).files[0];

		if (!file) {
			return;
		}

		const fr = new window.FileReader();

		fr.onload = function(event) {
			view._puzParser.parse(event.target.result).done(
				function(puzzle) {
					view._setFromPuzzle(puzzle);

					view._updateStoredPuzzle();

					view._toggleDisplay();
				}
			);
		};

		fr.readAsArrayBuffer(file);
	}

	_handleSolutionChange(event) {
		const view = this;

		view._updateStoredPuzzle(true);

		$(event.currentTarget).removeClass('error');
	}

	_handleClueChange(event, data) {
		const view = this;

		var clue = view._puzzle.clues[data.direction][data.number];

		view._$currentClueContainer.html(data.number + ' ' + _.capitalize(data.direction) + ': ' + clue);
	}
}

exports = module.exports = PlayImportedPuzzleView;
