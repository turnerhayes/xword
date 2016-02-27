"use strict";

var $        = require('jquery');
var _        = require('lodash');
var Q        = require('q');
var Backbone = require('backbone');


const SERVER_SEND_DEBOUNCE_INTERVAL = 500;

const LOCALSTORAGE_KEY = 'solution_' + document.location.pathname;

exports = module.exports = Backbone.View.extend({
	events: {
	},

	initialize: function() {
		var view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);

		view._debouncedSendToServer = _.debounce(
			view._sendSolutionToServer,
			SERVER_SEND_DEBOUNCE_INTERVAL
		);
	},

	render: function() {
		var view = this;

		Backbone.View.prototype.render.apply(view, arguments);

		view._$grid = view.$('.crossword-grid');

		view._loadSolution();
	},

	_loadSolution: function() {
		var view = this;

		var solution = window.localStorage.getItem(LOCALSTORAGE_KEY);

		if (!solution) {
			return;
		}

		solution = JSON.parse(solution);

		var $rows = view._$grid.find('.puzzle-row');

		_.each(
			solution,
			function(row, rowIndex) {
				var $cells = $rows.eq(rowIndex).find('.cell');

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
	},

	_getCurrentAnswers: function() {
		var view = this;

		var answers = _.map(
			view._$grid.find('.puzzle-row'),
			function(row) {
				return _.map(
					$(row).find('.cell'),
					function(cell) {
						var $cell = $(cell);

						if ($cell.hasClass('block-cell')) {
							return '#';
						}

						return $cell.find('.letter-input').val() || null;
					}
				);
			}
		);

		return answers;
	},

	_sendSolutionToServer: function(solution) {
		var view = this;
		
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
	},

	_updateAnswer: function() {
		var view = this;

		var answers = view._getCurrentAnswers();

		window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(answers));

		view._debouncedSendToServer(answers);
	}
});
