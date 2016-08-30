"use strict";

/**
 * Puzzle filler view module
 *
 * @module views/puzzle-filler
 */

import _                           from "lodash";
import $                           from "jquery";
import Q                           from "q";
import Backbone                    from "backbone";
import Base64ArrayBuffer           from "base64-arraybuffer";
import XPuz                        from "xpuz";
import DictionaryData              from "../data/dictionary";
import puzzleGridAndCluesTemplate  from "../../templates/partials/xword-grid-and-clues.hbs";
import clueItemTemplate            from "../../templates/partials/clue-item.hbs";
import answerOptionsDialogTemplate from "../../templates/partials/answer-options-dialog.hbs";

const Puzzle    = XPuz.Puzzle;
const PUZParser = XPuz.PUZ;


/**
 * Puzzle object class
 * @external "xpuz.Puzzle"
 */

/**
 * Backbone view class
 * @external "Backbone.View"
 * @see {@link http://backbonejs.org/#View|View}
 */

/**
 * Q promise class
 * @external "Q.Promise"
 * @see {@link https://github.com/kriskowal/q/wiki/API-Reference|Q}
 */

const _events = {
	'submit .create-puzzle-form': '_handleFormSubmit',
	'change .file-upload': '_handleChangeFileUpload',
	'click .cell': '_handleCellClick',
	'click .export-to-file-button': '_handleClickExportToFile',
	'contextmenu .crossword-cell': '_handleContextmenuCrosswordCell',
	'click .keep-puzzle-button': '_handleClickKeepPuzzleButton',
	'click .validate-puzzle-button': '_handleClickValidatePuzzleButton',
};

const $body = $(document.body);

window._DEVELOPMENT = window._DEVELOPMENT || true;


// NOTE: The following functions (_termMatchesLetters, _findAnswers) must remain
// executable from a worker context--that means no DOM access, no references to
// imports in this file, nor any import calls of its own--only native JS that can be run in a worker
function _termMatchesLetters(term, letters) {
	for (let i = term.length - 1; i >= 0; i--) {
		if (letters[i] !== void 0 && term[i] !== letters[i]) {
			return false;
		}
	}

	return true;
}

function _findAnswers(args) {
	var terms = args.terms;
	var acrossIndex = args.acrossIndex;
	var downIndex = args.downIndex;
	var acrossLength = args.acrossLength;
	var downLength = args.downLength;
	var currentAcrossLetters = args.currentAcrossLetters;
	var currentDownLetters = args.currentDownLetters;

	var acrossCandidates;

	if (acrossIndex !== void 0) {
		acrossCandidates = terms[acrossLength];	
	}

	var downCandidates;

	if (downIndex !== void 0) {
		downCandidates = terms[downLength];
	}

	if (acrossCandidates !== void 0 && currentAcrossLetters !== void 0) {
		acrossCandidates = acrossCandidates.filter(
			function(termItem) {
				return _termMatchesLetters(termItem.term, currentAcrossLetters);
			}
		);
	}

	if (acrossCandidates !== void 0 && currentDownLetters !== void 0) {
		downCandidates = downCandidates.filter(
			function(termItem) {
				return _termMatchesLetters(termItem.term, currentDownLetters);
			}
		);
	}

	if (acrossCandidates === void 0) {
		return {
			'': downCandidates.map(
				function(term) {
					return term.term;
				}
			)
		};
	}
	else {
		if (downCandidates === void 0) {
			return acrossCandidates.reduce(
				function(candidates, acrossCandidate) {
					candidates[acrossCandidate.term] = [];
					return candidates;
				},
				{}
			);
		}

		return acrossCandidates.reduce(
			function(candidates, acrossCandidate) {
				var downLetters, downs;

				if (currentDownLetters) {
					downLetters = (currentDownLetters || []).slice(0); // clone

					// Insert the candidate letter to check down terms against
					downLetters.splice(
						downIndex,
						1,
						acrossCandidate.term[acrossIndex]
					);
				}


				downs = downCandidates.reduce(
					function(downCandidatesForAcross, downCandidate) {
						if (
							downCandidate.term !== acrossCandidate.term &&
							downCandidate.term[downIndex] === acrossCandidate.term[acrossIndex] &&
							(
								downLetters === void 0 ||
								_termMatchesLetters(
									downCandidate.term,
									downLetters
								)
							)
						) {
							downCandidatesForAcross.push(downCandidate.term);
						}

						return downCandidatesForAcross;
					},
					[]
				);

				if (downs.length > 0) {
					candidates[acrossCandidate.term] = downs;
				}

				return candidates;
			},
			{}
		);
	}
}

const _workerContent = `
	(function(global) {
		"use strict";

		${_termMatchesLetters}

		${_findAnswers}

		global.onmessage = function(message) {
			global.postMessage(_findAnswers(message.data));
		}
	}(this));`;

/**
 * View for filling a puzzle from the dictionary.
 *
 * @extends external:"Backbone.View"
 */
class PuzzleFillerView extends Backbone.View {
	/**
	 * Events hash
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

		view._namespace = 'puzzle-filler-view-' + view.cid;

		view._$form = view.$('.create-puzzle-form');

		view._$boardContainer = view.$('.grid-and-clues');

		view._$directionIndicator = view.$('.direction-indicator');

		view._$findAnswersProgress = view.$('.find-answers-progress');

		view._fetchedLengths = [];

		view._puzParser = new PUZParser();
	}

	/**
	 * Renders the view.
	 *
	 * @override
	 * @return {PuzzleFillerView} this view
	 */
	render() {
		const view = this;

		Backbone.View.prototype.render.apply(view, arguments);

		view._attachEventListeners();

		view._setCellNumbering();

		if (window._DEVELOPMENT) {
			view.$('.keep-puzzle-button').removeClass('hidden');

			let b64string = localStorage.getItem('_PUZZLE');

			if (b64string) {
				view._puzParser.parse(PuzzleFillerView._base64ToArrayBuffer(b64string)).done(
					function(puzzle) {
						view._setFromPuzzle(puzzle);
					}
				);
			}
		}

		return view;
	}

	/**
	 * Creates a Puzzle object based on the current state of the board.
	 *
	 * @return {external:"xpuz.Puzzle"} the generated puzzle
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
								solution: $cell.find('.letter-input').val() || undefined
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

	_attachEventListeners() {
		const view = this;

		$body.off('click.' + view._namespace).on(
				'click.' + view._namespace,
				'.down-option',
				_.bind(view._handleClickAnswerOption, view)
			);
	}

	_getTermLengths() {
		const view = this;

		const puzzle = view.generatePuzzleFromBoard();

		let across = {};
		let down = {};

		let currentAcrossClueNumber = null;
		let currentAcrossLength = 0;

		let downLengths = {};

		_.each(
			puzzle.grid,
			function(row) {
				_.each(
					row,
					function(cell, columnIndex) {
						if (
							!_.isNull(currentAcrossClueNumber) && (
								columnIndex === 0 ||
								cell.isBlockCell
							)
						) {
							if (currentAcrossLength > 1) {
								across[currentAcrossClueNumber] = currentAcrossLength;
							}

							currentAcrossClueNumber = null;
							currentAcrossLength = 0;
						}

						if (cell.isBlockCell) {
							_.each(
								downLengths[columnIndex],
								function(downClue) {
									downClue.isTerminated = true;
								}
							);
						}
						else {
							currentAcrossLength++;

							if (cell.clueNumber && _.isNull(currentAcrossClueNumber)) {
								currentAcrossClueNumber = cell.clueNumber;
							}

							if (
								cell.clueNumber &&
								_.isUndefined(
									_.find(
										downLengths[columnIndex],
										{
											isTerminated: false
										}
									)
								)
							) {
								if (!(columnIndex in downLengths)) {
									downLengths[columnIndex] = [];
								}

								downLengths[columnIndex].push({
									clueNumber: cell.clueNumber,
									length: 0,
									isTerminated: false
								});
							}

							if (downLengths[columnIndex]) {
								_.each(
									downLengths[columnIndex],
									function(downClue) {
										if (downClue.isTerminated) {
											return;
										}

										downClue.length++;
									}
								);
							}
						}

					}
				);
			}
		);

		_.each(
			_.flatten(_.values(downLengths)),
			function(downClue) {
				if (downClue.length === 1) {
					return;
				}

				down[downClue.clueNumber] = downClue.length;
			}
		);

		return {
			across: across,
			down: down
		};
	}

	_setFromPuzzle(puzzle) {
		const view = this;

		const grid = puzzleGridAndCluesTemplate({
			puzzle: puzzle,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');
	}

	_setCellNumbering() {
		const view = this;

		var clueNumber = 0;

		const clues = {
			across: {},
			down: {}
		};

		const $rows = view._$boardContainer.find('.puzzle-row');

		$rows.each(
			function(rowIndex) {
				var $row = $(this);
				var $cells = $row.find('.cell');

				$cells.each(
					function(columnIndex) {
						const $cell = $(this);
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
	}

	_updateCluesList(cluesDefinition) {
		const view = this;

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
	}

	_getCellPosition($cell) {
		return [$cell.index(), $cell.closest('.puzzle-row').prevAll('.puzzle-row').length];
	}

	_getCandidateTerms($cell) {
		const view = this;

		let cellPosition = view._getCellPosition($cell);

		let $firstAcrossCell = $cell.prevUntil('.block-cell').last();

		if ($firstAcrossCell.length === 0) {
			$firstAcrossCell = $cell;
		}

		let $acrossCells = $firstAcrossCell.add($firstAcrossCell.nextUntil('.block-cell'));

		let acrossIndex = $acrossCells.index($cell);

		let acrossLength = $acrossCells.length;

		let $downCells = $cell;

		let $row = $cell.closest('.puzzle-row');

		$row.prevAll('.puzzle-row').each(
			function() {
				let $prevCell = $(this).find('.crossword-cell:nth-child(' + (cellPosition[0] + 1) + ')');

				if ($prevCell.length > 0) {
					// Prepend cell, because we're walking backwards
					$downCells = $prevCell.add($downCells);
				}
				else {
					// Found the previous block cell. No more iteration needed.
					return false;
				}
			}
		);

		$row.nextAll('.puzzle-row').each(
			function() {
				let $nextCell = $(this).find('.crossword-cell:nth-child(' + (cellPosition[0] + 1) + ')');

				if ($nextCell.length > 0) {
					$downCells = $downCells.add($nextCell);
				}
				else {
					// Found the next block cell. No more iteration needed.
					return false;
				}
			}
		);

		let downLength = $downCells.length;

		let downIndex = $downCells.index($cell);

		let currentAcrossLetters = _.map(
			$acrossCells.find('.letter-input'),
			function(input) {
				return $(input).val() || undefined;
			}
		);

		let currentDownLetters = _.map(
			$downCells.find('.letter-input'),
			function(input) {
				return $(input).val() || undefined;
			}
		);

		if (_.compact(currentAcrossLetters).length === 0) {
			currentAcrossLetters = undefined;
		}

		if (_.compact(currentDownLetters).length === 0) {
			currentDownLetters = undefined;
		}

		// One-cell answers are not valid; ignore them.
		if (acrossLength === 1) {
			acrossIndex = undefined;
		}

		if (downLength === 1) {
			downIndex = undefined;
		}

		if (_.isUndefined(downIndex) && _.isUndefined(acrossIndex)) {
			return Q([]);
		}

		// If we're in a nonempty cell, pretend the cell is empty for matching purposes,
		// so that we're not constrained to match with the existing letter
		if (!_.isUndefined(currentAcrossLetters) && !_.isUndefined(acrossIndex)) {
			currentAcrossLetters[acrossIndex] = undefined;
		}

		if (!_.isUndefined(currentDownLetters) && !_.isUndefined(downIndex)) {
			currentDownLetters[downIndex] = undefined;
		}

		return DictionaryData.findByTermLengths(_.uniq([downLength, acrossLength])).then(
			function(termsByLength) {
				let args = {
					terms: _.reduce(
						termsByLength,
						function(terms, termArray, termLength) {
							terms[termLength] = _.map(termArray, (t) => t.toJSON());

							return terms;
						},
						termsByLength
					),
					acrossIndex: acrossIndex,
					downIndex: downIndex,
					acrossLength: acrossLength,
					downLength: downLength,
					currentAcrossLetters: currentAcrossLetters,
					currentDownLetters: currentDownLetters,
				};


				if (_.isFunction(window.Worker)) {
					let deferred = Q.defer();

					let worker = new window.Worker(
						URL.createObjectURL(
							new Blob([_workerContent], { type: 'text/javascript' })
						)
					);

					worker.onmessage = function(message) {
						deferred.resolve(message.data);

						worker.terminate();
						worker = undefined;
					};

					worker.postMessage(args);

					return deferred.promise;
				}
				else {
					return _findAnswers(args);
				}
			}
		);
	}

	/**
	 * Ensure that the filled answers are valid (not repeated, all exist, etc.)
	 *
	 * @return {external:"Q.Promise"} resolves to an object containing information about
	 * any issues with the answers, or undefined if there are no issues.
	 */
	_validateAnswers() {
		const view = this;

		let puzzle = view.generatePuzzleFromBoard();

		let acrossSolutions = [];

		let downSolutions = [];

		let across = '', down = [];

		_.each(
			puzzle.grid,
			function(row) {
				_.each(
					row,
					function(cell, cellIndex) {
						if (cell.isBlockCell) {
							if (_.size(across) > 1) {
								acrossSolutions.push(across);
							}

							if (_.size(down[cellIndex]) > 1) {
								downSolutions.push(down[cellIndex]);
							}

							delete down[cellIndex];

							across = '';
						}
						else if (!_.isUndefined(cell.solution)) {
							across += cell.solution;
							down[cellIndex] = (down[cellIndex] || '') + cell.solution;
						}
						else {
							across += '_';
							down[cellIndex] = (down[cellIndex] || '') + '_';
						}
					}
				);

				if (_.size(across) > 1) {
					acrossSolutions.push(across);
				}

				across = '';
			}
		);

		if (!_.isEmpty(down)) {
			_.each(
				down,
				function(downSolution) {
					if (_.size(downSolution) > 1) {
						downSolutions.push(downSolution);
					}
				}
			);
		}

		let allSolutions = _.concat(acrossSolutions, downSolutions);

		let report = {};

		let repeated = _.intersection(
			acrossSolutions,
			downSolutions
		);
		
		if (_.size(repeated) > 0) {
			report.repeated = repeated;
		}

		let missing = _.filter(
			allSolutions,
			(solution) => solution.indexOf('_') >= 0
		);

		if (_.size(missing) > 0) {
			report.missing = missing;
		}

		return DictionaryData.verifyValidTerms(
			allSolutions.filter((s) => s.indexOf('_') < 0)
		).then(
			function(result) {
				if (!_.isUndefined(result)) {
					report.invalidTerms = result;

				}

				return report;
			}
		).then(
			function(report) {
				if (_.isEmpty(report)) {
					return undefined;
				}

				return report;
			}
		);
	}

	_dismissAnswersPopup() {
		$body.find('.answer-options-dialog').remove();
	}

	_mapTermsToCells() {
		const view = this;

		const map = {};

		let $rows = view._$boardContainer.find('.puzzle-row').each(
			function() {
				let acrossClueNumber;
				let acrossTerm = '';
				let $acrossCells = $();

				$(this).find('.cell').each(
					function() {
						let $cell = $(this);

						if ($cell.hasClass('block-cell')) {
							if (acrossTerm.length > 1) {
								if (!(acrossTerm in map)) {
									map[acrossTerm] = [];
								}

								map[acrossTerm].push({
									direction: 'across',
									clueNumber: acrossClueNumber,
									$cells: $acrossCells,
								});
							}

							acrossTerm = '';
							$acrossCells = $();
							acrossClueNumber = undefined;
						}
						else {
							if (_.isUndefined(acrossClueNumber)) {
								acrossClueNumber = $cell.data('containing-clue-across');
							}

							acrossTerm += $cell.find('.letter-input').val();
							$acrossCells = $acrossCells.add($cell);
						}
					}
				);

				if (acrossTerm.length > 1) {
					if (!(acrossTerm in map)) {
						map[acrossTerm] = [];
					}

					map[acrossTerm].push({
						direction: 'across',
						clueNumber: acrossClueNumber,
						$cells: $acrossCells,
					});
				}

				acrossTerm = '';
				$acrossCells = $();
				acrossClueNumber = undefined;
			}
		);

		$rows.first().find('.cell').each(
			function(index) {
				let downTerm = '';
				let $downCells = $();
				let downClueNumber;
				
				$rows.find('.cell:nth-child(' + (index + 1) + ')').each(
					function() {
						var $cell = $(this);

						if ($cell.hasClass('block-cell')) {
							if (downTerm.length > 1) {
								if (!(downTerm in map)) {
									map[downTerm] = [];
								}

								map[downTerm].push({
									direction: 'down',
									clueNumber: downClueNumber,
									$cells: $downCells,
								});
							}

							downTerm = [];
							$downCells = $();
							downClueNumber = undefined;
						}
						else {
							if (_.isUndefined(downClueNumber)) {
								downClueNumber = $cell.data('containing-clue-down');
							}

							downTerm += $cell.find('.letter-input').val();
							$downCells = $downCells.add($cell);
						}
					}
				);

				if (downTerm.length > 1) {
					if (!(downTerm in map)) {
						map[downTerm] = [];
					}

					map[downTerm].push({
						direction: 'down',
						clueNumber: downClueNumber,
						$cells: $downCells,
					});
				}
			}
		);

		return map;
	}

	_handleClickKeepPuzzleButton() {
		const view = this;

		let puzzle = view.generatePuzzleFromBoard();

		localStorage.setItem('_PUZZLE', PuzzleFillerView._arrayBufferToBase64(view._puzParser.generate(puzzle)));
	}

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

	_handleClickAnswerOption(event) {
		const view = this;

		let $chosenOption = $(event.currentTarget);

		let cellPosition = $chosenOption.closest('.answer-options-dialog').data('cell-position');

		let across = $chosenOption.data('across-term');

		let down = $chosenOption.data('down-term');

		let $cell = view._$boardContainer.find(
			'.puzzle-row:nth-child(' + (cellPosition[1] + 1) + ') .crossword-cell:nth-child(' +
			(cellPosition[0] + 1) + ')'
		);

		let $row = $cell.closest('.puzzle-row');

		let $firstAcrossCell = $cell.prevUntil('.block-cell').last();

		if ($firstAcrossCell.length === 0) {
			$firstAcrossCell = $cell;
		}

		$firstAcrossCell.add($firstAcrossCell.nextUntil('.block-cell')).each(
			function(index) {
				$(this).find('.letter-input').val(across[index].toUpperCase());
			}
		);

		let $firstDownRow = $();

		$row.prevAll('.puzzle-row').each(
			function() {
				let $prevRow = $(this);

				if ($prevRow.find(':nth-child(' + (cellPosition[0] + 1) + ').crossword-cell').length === 0) {
					return false;
				}

				$firstDownRow = $prevRow;
			}
		);

		if ($firstDownRow.length === 0) {
			$firstDownRow = $row;
		}

		$firstDownRow.add($firstDownRow.nextAll('.puzzle-row')).each(
			function(index) {
				if (index >= down.length) {
					return false;
				}

				$(this).find(':nth-child(' + (cellPosition[0] + 1) + ').crossword-cell .letter-input')
					.val(down[index].toUpperCase());
			}
		);

		view._dismissAnswersPopup();
	}

	_handleClickValidatePuzzleButton() {
		const view = this;

		let map = view._mapTermsToCells();

		view._$boardContainer.find('.crossword-cell.invalid').removeClass('invalid invalid-term repeated-term');

		view._validateAnswers().done(
			function(report) {
				if (_.isUndefined(report)) {
					return;
				}

				_.each(
					report.invalidTerms,
					function(term) {
						_.each(
							map[term],
							function(termInstance) {
								termInstance.$cells.addClass('invalid invalid-term').attr('data-invalid-message', 'Term is not in dictionary');
							}
						);
					}
				);

				_.each(
					report.repeated,
					function(term) {
						_.each(
							map[term],
							function(termInstance) {
								termInstance.$cells.each(
									function() {
										let $cell = $(this);

										$cell.addClass('invalid repeated-term');

										let msg = $cell.attr('data-invalid-message');

										if (msg) {
											msg += '\n'; 
										}
										else {
											msg = '';
										}

										
										msg += 'Term is duplicated';
										
										$cell.attr('data-invalid-message', msg);
									}
								);
							}
						);
					}
				);
			}
		);
	}

	_handleCellClick(event) {
		const view = this;

		var $cell = $(event.currentTarget);

		if (event.shiftKey) {
			$cell.toggleClass('block-cell crossword-cell');

			view._setCellNumbering();
		}
	}

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

	static _arrayBufferToBase64(buffer) {
		return Base64ArrayBuffer.encode(buffer);
	}

	static _base64ToArrayBuffer(b64string) {
		return Base64ArrayBuffer.decode(b64string);
	}

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
					view._setFromPuzzle(puzzle);
				}
			);
		};

		fr.readAsArrayBuffer(file);
	}

	_handleContextmenuCrosswordCell(event) {
		const view = this;

		event.preventDefault();

		view._$findAnswersProgress.removeClass('hidden');

		view._dismissAnswersPopup();

		let $cell = $(event.currentTarget);

		$cell.removeClass('no-candidates');

		view._getCandidateTerms($cell).done(
			function(candidates) {
				if (_.size(candidates) === 0) {
					$cell.addClass('no-candidates');
					return;
				}

				let $dialog = $(
					answerOptionsDialogTemplate({
						cellPosition: view._getCellPosition($(event.currentTarget)),
						terms: _.map(
							candidates,
							function(downOptions, acrossTerm) {
								return {
									acrossTerm: acrossTerm,
									downOptions: downOptions,
								};
							}
						),
					})
				);
				$body.append($dialog);

				$dialog.css({
					top: event.pageY + 'px',
					left: event.pageX + 'px'
				});

				view._$findAnswersProgress.addClass('hidden');

				$(document).off('.context-menu.' + view._namespace).on(
					'click.context-menu.' + view._namespace,
					function(event) {
						if ($(event.target).closest('.answer-options-dialog').length === 0) {
							$dialog.remove();
							$dialog = undefined;

							$(document).off('.context-menu.' + view._namespace);
						}
					}
				);
			}
		);
	}
}

exports = module.exports = PuzzleFillerView;
