"use strict";

/**
 * Adds entries to the dictionary
 *
 * @module views/crossword-puzzle
 */

/**
 * Backbone view class
 *
 * @external Backbone/View
 * @see {@link http://backbonejs.org/#View|View}
 */

/**
 * Q promise class
 *
 * @external Q/Promise
 * @see {@link https://github.com/kriskowal/q/wiki/API-Reference|Q}
 */

import $        from 'jquery';
import _        from 'lodash';
import Q        from 'q';
import Backbone from 'backbone';

const SERVER_SEND_DEBOUNCE_INTERVAL = 500;

const LOCALSTORAGE_KEY = 'solution_' + document.location.pathname;

const _events = {
	'crossword-check-solutions': '_handleCheckSolutions'
};

/**
 * View for managing a crossword puzzle.
 *
 * @extends external:Backbone/View
 */
class CrosswordPuzzleView extends Backbone.View {
	/**
	 * Events object
	 *
	 * @type object
	 */
	get events() {
		return _events;
	}

	/**
	 * Intitializes the view.
	 *
	 * @override
	 */
	initialize() {
		const view = this;

		super.initialize(...arguments);

		view._debouncedSendToServer = _.debounce(
			view._sendSolutionToServer,
			SERVER_SEND_DEBOUNCE_INTERVAL
		);
	}

	/**
	 * Renders the view.
	 *
	 * @override
	 *
	 * @returns {module:views/crossword-puzzle~CrosswordPuzzleView} this view
	 */
	render() {
		const view = this;

		super.render(...arguments);

		view._$grid = view.$('.crossword-grid');

		view._loadSolution();

		return view;
	}

	/**
	 * Validates the current solution.
	 *
	 * @todo implement
	 */
	checkSolution() {
		const view = this;

		const solution = view._getCurrentAnswers();
	}

	/**
	 * Loads the stored solution from local storage into the puzzle.
	 *
	 * @private
	 *
	 * @returns {module:views/crossword-puzzle~CrosswordPuzzleView} this view
	 */
	_loadSolution() {
		const view = this;

		let solution = window.localStorage.getItem(LOCALSTORAGE_KEY);

		if (!solution) {
			return;
		}

		solution = JSON.parse(solution);

		const $rows = view._$grid.find('.puzzle-row');

		_.each(
			solution,
			function(row, rowIndex) {
				const $cells = $rows.eq(rowIndex).find('.cell');

				_.each(
					row,
					function(cell, cellIndex) {
						if (cell === '#') {
							return;
						}

						if (cell) {
							$cells.eq(cellIndex).find('.letter-input').val(cell);
						}
					}
				);
			}
		);

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
	 * Sends the current solution to the server to be persisted.
	 *
	 * @private
	 *
	 * @param {Array<Array<string>>} solution - a two-dimensional array like that
	 *	returned by {@link module:views/crossword-puzzle~CrosswordPuzzleView#_getCurrentAnswers|getCurrentAnswers()}
	 *
	 * @returns {Q/Promise} a promise that resolves when the solution has been sent
	 */
	_sendSolutionToServer(solution) {
		const view = this;
		
		return Q(
			$.post({
				url: "/puzzles/solution",
				data: JSON.stringify({
					solution: solution
				}),
				dataType: 'json',
				contentType: 'application/json'
			})
		);
	}

	/**
	 * Persists the current state of the user's solution.
	 *
	 * @private
	 */
	_updateAnswer() {
		const view = this;

		const answers = view._getCurrentAnswers();

		window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(answers));

		view._debouncedSendToServer(answers);
	}

	/**
	 * Handles the `crossword-check-solutions` event.
	 *
	 * @private
	 */
	_handleCheckSolutions() {
		const view = this;

		view.checkSolution();
	}
};

export default CrosswordPuzzleView;
