"use strict";

var $                           = require('jquery');
var _                           = require('lodash');
var Q                           = require('q');
var Backbone                    = require('backbone');
var PUZParser                   = require('xpuz/parsers/puz');
var IPUZParser                  = require('xpuz/parsers/ipuz');
var Puzzle                      = require('xpuz/lib/puzzle');
var puzzleGridAndCluesTemplate  = require('../../templates/partials/xword-grid-and-clues.hbs');
var clueItemTemplate            = require('../../templates/partials/clue-item.hbs');

exports = module.exports = Backbone.View.extend({
	events: {
		'submit .create-puzzle-form': '_handleFormSubmit',
		'click .cell': '_handleCellClick',
		'click .export-to-file-button': '_handleClickExportToFile',
		'change .file-upload': '_handleChangeFileUpload'
	},

	initialize: function() {
		var view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);

		view._$form = view.$('.create-puzzle-form');

		view._$boardContainer = view.$('.grid-and-clues');

		view._puzParser = new PUZParser();
		view._ipuzParser = new IPUZParser();
	},

	render: function() {
		var view = this;

		Backbone.View.prototype.render.apply(view, arguments);

		view._setCellNumbering();

		return view;
	},

	generatePuzzleFromBoard: function() {
		var view = this;

		var board = _.reduce(
			view._$boardContainer.find('.puzzle-row'),
			function(board, row) {
				board.push(
					_.map(
						$(row).find('.cell'),
						function(cellElement) {
							var $cell = $(cellElement);

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

		var clues = {
			across: {},
			down: {}
		};


		var $acrossCluesList = view.$('.clues-list-across');
		var $downCluesList = view.$('.clues-list-down');

		$acrossCluesList.find('.clues-list-item').each(
			function() {
				var $item = $(this);

				clues.across[$item.data('clue-number')] = $item.find('.clue-input').val();
			}
		);

		$downCluesList.find('.clues-list-item').each(
			function() {
				var $item = $(this);

				clues.down[$item.data('clue-number')] = $item.find('.clue-input').val();
			}
		);

		return new Puzzle({
			grid: board,
			clues: clues
		});
	},

	_setFromPuzzle: function(puzzle) {
		var view = this;

		var grid = puzzleGridAndCluesTemplate({
			puzzle: puzzle,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');
	},

	_setCellNumbering: function() {
		var view = this;

		var clueNumber = 0;

		var clues = {
			across: {},
			down: {}
		};

		var $rows = view._$boardContainer.find('.puzzle-row');

		$rows.each(
			function(rowIndex) {
				var $row = $(this);
				var $cells = $row.find('.cell');

				$cells.each(
					function(columnIndex) {
						var $cell = $(this);
						var across = false;
						var down = false;

						var clueLength;

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
								clueLength = 1;

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
	},

	_updateCluesList: function(cluesDefinition) {
		var view = this;

		var existingClues = {
			across: {},
			down: {}
		};

		var $acrossCluesList = view.$('.clues-list-across');
		var $downCluesList = view.$('.clues-list-down');

		$acrossCluesList.find('.clues-list-item').each(
			function() {
				var $clueItem = $(this);

				var clueText = $clueItem.find('.clue-input').val();

				if (clueText) {
					existingClues.across[$clueItem.attr('value')] = clueText;
				}
			}
		);

		$downCluesList.find('.clues-list-item').each(
			function() {
				var $clueItem = $(this);

				var clueText = $clueItem.find('.clue-input').val();

				if (clueText) {
					existingClues.down[$clueItem.attr('value')] = clueText;
				}
			}
		);

		var acrossClues = _.map(
			cluesDefinition.across,
			function(clueDefinition, clueNumber) {
				return clueItemTemplate({
					clueNumber: clueNumber,
					direction: 'across',
					editable: true
				});
			}
		).join('');

		var downClues = _.map(
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
	},

	_handleFormSubmit: function(event) {
		var view = this;

		event.preventDefault();

		var width = parseInt(view._$form.find('[name="width"]').val(), 10);
		var height = parseInt(view._$form.find('[name="height"]').val(), 10);

		var grid = puzzleGridAndCluesTemplate({
			width: width,
			height: height,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');
	},

	_handleCellClick: function(event) {
		var view = this;

		var $cell = $(event.currentTarget);

		if (event.shiftKey) {
			$cell.toggleClass('block-cell crossword-cell');

			view._setCellNumbering();
		}
	},

	_handleClickExportToFile: function() {
		var view = this;

		var puzzle = view.generatePuzzleFromBoard();

		var puzzleBuffer = view._puzParser.generate(puzzle);

		var blob = new Blob([puzzleBuffer]);

		var url = URL.createObjectURL(blob);

		var link = document.createElement('a');

		link.setAttribute('href', url);

		link.setAttribute('download', 'puzzle.puz');

		link.click();
	},

	_handleChangeFileUpload: function(event) {
		var view = this;

		var file = event.currentTarget.files[0];

		if (!file) {
			return;
		}

		var fr = new FileReader();

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
});
