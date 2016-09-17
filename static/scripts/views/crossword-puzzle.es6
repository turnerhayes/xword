"use strict";

import $        from 'jquery';
import _        from 'lodash';
import Q        from 'q';
import Backbone from 'backbone';


const SERVER_SEND_DEBOUNCE_INTERVAL = 500;

const LOCALSTORAGE_KEY = 'solution_' + document.location.pathname;

const _events = {
	'crossword-check-solutions': '_handleCheckSolutions'
};

class CrosswordPuzzleView extends Backbone.View {
	get events() {
		return _events;
	}

	initialize() {
		const view = this;

		super.initialize(...arguments);

		view._debouncedSendToServer = _.debounce(
			view._sendSolutionToServer,
			SERVER_SEND_DEBOUNCE_INTERVAL
		);
	}

	render() {
		const view = this;

		super.render(...arguments);

		view._$grid = view.$('.crossword-grid');

		view._loadSolution();
	}

	checkSolution() {
		const view = this;

		const solution = view._getCurrentAnswers();
	}

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

	_updateAnswer() {
		const view = this;

		const answers = view._getCurrentAnswers();

		window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(answers));

		view._debouncedSendToServer(answers);
	}

	_handleCheckSolutions(event) {
		const view = this;

		view.checkSolution();
	}
};

exports = module.exports = CrosswordPuzzleView;
