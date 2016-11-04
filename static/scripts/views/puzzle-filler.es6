"use strict";

/**
 * Puzzle filler view module
 *
 * @module views/puzzle-filler
 */

/**
 * Puzzle object class
 *
 * @external XPuz/Puzzle
 * @see {@link http://turnerhayes.github.io/xpuz/module-xpuz_puzzle-Puzzle.html|Puzzle}
 */

/**
 * jQuery
 *
 * @external jQuery
 * @see {@link http://api.jquery.com|jQuery}
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

import _                                    from "lodash";
import $                                    from "jquery";
import Q                                    from "q";
import Backbone                             from "backbone";
import Base64ArrayBuffer                    from "base64-arraybuffer";
import XPuz                                 from "xpuz";
import DictionaryData                       from "../data/dictionary";
import puzzleGridAndCluesTemplate           from "../../templates/partials/xword-grid-and-clues.hbs";
import clueItemTemplate                     from "../../templates/partials/clue-item.hbs";
import answerOptionsDialogTemplate          from "../../templates/partials/answer-options-dialog.hbs";
import puzzleValidationStatusDialogTemplate from "../../templates/partials/modals/puzzle-validation-status.hbs";

const Puzzle    = XPuz.Puzzle;
const PUZParser = XPuz.Parsers.PUZ;

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

const whitespaceRegex = /\s/g;

window._DEVELOPMENT = window._DEVELOPMENT || true;

const USER_REPLACED_ERROR_TYPE = 'user_replaced';


// NOTE: The following functions (_substituteTerm, _checkWords, _findAnswers) must remain
// executable from a worker context--that means no DOM access, no references to
// imports in this file, nor any import calls of its own--only native JS that can be run in a worker

function _substituteTerm(term, adjacentWords, isAcross) {
	adjacentWords = JSON.parse(JSON.stringify(adjacentWords)); // deep clone

	var i, len, letterIndex, letterCount;

	for (i = 0, len = adjacentWords.length; i < len; i++) {
		for (
			letterIndex = 0, letterCount = adjacentWords[i].length;
			letterIndex < letterCount;
			letterIndex++
		) {
			if (
				(
					// If this was the selected cell, let it be replaced
					adjacentWords[i][letterIndex].isSelectedCellRow &&
					adjacentWords[i][letterIndex].isSelectedCellColumn
				) ||
				(
					// This cell is on the row or column (as appropriate), so potentially
					// replace
					(
						(isAcross && adjacentWords[i][letterIndex].isSelectedCellRow) ||
						(!isAcross && adjacentWords[i][letterIndex].isSelectedCellColumn)
					) &&
					// If the cell has no value let it be filled
					!adjacentWords[i][letterIndex].value
				)
			) {
				adjacentWords[i][letterIndex].value = term[letterIndex];
			}
			// If the cell value can't be set, and this is in the selected cell's row or column,
			// then the value has to match the term value
			else if (
				(
					(isAcross && adjacentWords[i][letterIndex].isSelectedCellRow) ||
					(!isAcross && adjacentWords[i][letterIndex].isSelectedCellColumn)
				) &&
				adjacentWords[i][letterIndex].value !== term[i]
			) {
				return false;
			}
		}
	}

	return adjacentWords;
}

function _checkWords(adjacentWords, termString) {
	var i;
	var len;

	for (i = 0, len = adjacentWords.length; i < len; i++) {
		/* Single-cell "words" are not actually adjacent words but parts of the main word
		 * E.g.
		 *
		 * # A B
		 * C D E
		 * # F G
		 *
		 * C is a "single-cell" word going down, but it's not *really* a down word, just
		 * a part of the across word that doesn't have any down adjacents. We can ignore
		 * these for word-checking.
		 */

		if (adjacentWords[i].length === 1) {
			continue;
		}

		if (!(new RegExp(',' + adjacentWords[i].map((l) => l.value || '.').join('') + ',')).test(termString)) {
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
	var adjacentDownWords = args.adjacentDownWords;
	var adjacentAcrossWords = args.adjacentAcrossWords;

	var termString = [];

	var termLength;
	var i;
	var len;

	// Cosntruct an object where all the supplied terms are keys. This will
	// make it easier to check if a given term is valid.
	for (termLength in terms) {
		if (!Object.prototype.hasOwnProperty.call(terms, termLength)) {
			continue;
		}

		for (i = 0, len = terms[termLength].length; i < len; i++) {
			termString.push(terms[termLength][i].term);
		}
	}

	termString = ',' + termString.join(',') + ',';

	var acrossCandidates;

	if (acrossIndex !== void 0) {
		acrossCandidates = terms[acrossLength];	
	}

	var downCandidates;

	if (downIndex !== void 0) {
		downCandidates = terms[downLength];
	}

	if (acrossCandidates !== void 0) {
		acrossCandidates = acrossCandidates.filter(
			function(termItem) {
				const substituted = _substituteTerm(termItem.term, adjacentDownWords, true);

				if (substituted === false) {
					return false;
				}

				return _checkWords(substituted, termString);
			}
		);
	}

	if (downCandidates !== void 0) {
		downCandidates = downCandidates.filter(
			function(termItem) {
				const substituted = _substituteTerm(termItem.term, adjacentAcrossWords, false);
				
				if (substituted === false) {
					return false;
				}

				return _checkWords(substituted, termString);
			}
		);
	}

	if (acrossCandidates === void 0) {
		// there are no across candidates; all down candidates that match the existing
		// column letters are valid
		if (downCandidates !== void 0 && downCandidates.length === 0) {
			return {};
		}
		
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
			// there are no down candidates; all across candidates that match the existing
			// row letters are valid
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
				var acrossWords = JSON.parse(JSON.stringify(adjacentAcrossWords)); // deep clone

				// Insert the across candidate into the existing across candidates to check the
				// down candidate against it
				acrossWords[downIndex].forEach(
					function(letter, letterIndex) {
						letter.value = acrossCandidate.term[letterIndex];

						// Prevent any cell in this across word from being replaced, because
						// the point of this routine is to determine whether each down candidate
						// would be valid if this across candidate were used
						letter.isSelectedCellRow = false;
					}
				);

				var downs = downCandidates.reduce(
					function(downCandidatesForAcross, downCandidate) {
						const substituted = _substituteTerm(downCandidate.term, acrossWords, false);

						if (substituted !== false && _checkWords(substituted, termString)) {
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

		${_substituteTerm}

		${_checkWords}

		${_findAnswers}

		global.onmessage = function(message) {
			global.postMessage(_findAnswers(message.data));
		}
	}(this));`;

/**
 * View for filling a puzzle from the dictionary.
 *
 * @extends external:Backbone/View
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
	 * @returns {module:views/puzzle-filler~PuzzleFillerView} this view
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
								solution: $cell.find('.letter-input').val().replace(whitespaceRegex, '') || null
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
	 * Attaches any event listeners that need to be attached outside of the events view member.
	 *
	 * @private
	 *
	 * @returns {module:views/puzzle-filler~PuzzleFillerView} this view
	 */
	_attachEventListeners() {
		const view = this;

		$body.off('click.' + view._namespace).on(
			'click.' + view._namespace,
			'.down-option',
			_.bind(view._handleClickAnswerOption, view)
		);
	}

	/**
	 * A mapping of across and down clue numbers to term lengths.
	 *
	 * @typedef {object} TermLengthResult
	 *
	 * @property {object} across - an object mapping across clue number to length 
	 * @property {object} down - an object mapping down clue number to length 
	 */

	/**
	 * Gets a summary of the lengths of clues.
	 *
	 * @private
	 *
	 * @returns {module:views/puzzle-filler~TermLengthResult} summary of term lengths
	 */
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

	/**
	 * Sets up the puzzle grid from the {@link external:XPuz/Puzzle} provided.
	 *
	 * @private
	 *
	 * @param {external:XPuz/Puzzle} puzzle - the puzzle from which to generate the game grid
	 *
	 * @returns {module:views/puzzle-filler~PuzzleFillerView} this view
	 */
	_setFromPuzzle(puzzle) {
		const view = this;

		const grid = puzzleGridAndCluesTemplate({
			puzzle: puzzle,
			editable: true
		});

		view._$boardContainer.replaceWith(grid);

		view._$boardContainer = view.$('.grid-and-clues');
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

		return view;
	}

	/**
	 * Finds the position of the specified cell in the grid.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $cell - a jQuery object containing the `.cell` to locate
	 *
	 * @returns {Array<Number>} a two-element array consisting of the horizontal index of the cell
	 *	followed by its vertical index
	 */
	_getCellPosition($cell) {
		return [$cell.index(), $cell.closest('.puzzle-row').prevAll('.puzzle-row').length];
	}

	/**
	 * Gets all terms that are valid options to fill in the cells.
	 *
	 * @private
	 *
	 * @param {external:jQuery} $cell - a jQuery object containing the `.cell` around which to
	 *	locate the clues
	 *
	 * @returns {object} an object mapping clues for across cells to an array of compatible down
	 *	clues
	 */
	_getCandidateTerms($cell) {
		const view = this;

		const cellPosition = view._getCellPosition($cell);

		let $firstAcrossCell = $cell.prevUntil('.block-cell').last();

		if ($firstAcrossCell.length === 0) {
			$firstAcrossCell = $cell;
		}

		let $acrossCells = $firstAcrossCell.add($firstAcrossCell.nextUntil('.block-cell'));

		let acrossIndex = $acrossCells.index($cell);

		let acrossLength = $acrossCells.length;

		let $downCells = $cell;

		const $row = $cell.closest('.puzzle-row');

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

		const adjacentDownWords = [];
		const adjacentAcrossWords = [];

		$acrossCells.each(
			function() {
				const $acrossCell = $(this);

				const downWord = [];

				const cellIndex = $acrossCell.index();

				$row.prevAll('.puzzle-row').each(
					function() {
						const $c = $(this).find('.crossword-cell:nth-child(' + (cellIndex + 1) + ')');

						if ($c.length === 0) {
							return false;
						}

						downWord.unshift({
							isSelectedCellRow: false,
							isSelectedCellColumn: cellIndex === cellPosition[0],
							value: $c.find('.letter-input').val().replace(whitespaceRegex, ''),
						});
					}
				);

				downWord.push({
					isSelectedCellRow: true,
					isSelectedCellColumn: cellIndex === cellPosition[0],
					value: $acrossCell.find('.letter-input').val().replace(whitespaceRegex, ''),
				});

				$row.nextAll('.puzzle-row').each(
					function() {
						const $c = $(this).find('.crossword-cell:nth-child(' + (cellIndex + 1) + ')');

						if ($c.length === 0) {
							return false;
						}

						downWord.push({
							isSelectedCellRow: false,
							isSelectedCellColumn: cellIndex === cellPosition[0],
							value: $c.find('.letter-input').val().replace(whitespaceRegex, ''),
						});
					}
				);

				adjacentDownWords.push(downWord);
			}
		);

		$downCells.each(
			function() {
				const $downCell = $(this);

				const acrossWord = [];

				const rowIndex = $downCell.closest('.puzzle-row').index();

				$downCell.prevAll('.cell').each(
					function() {
						const $c = $(this);

						if ($c.hasClass('block-cell')) {
							return false;
						}

						acrossWord.unshift({
							isSelectedCellRow: rowIndex === cellPosition[1],
							isSelectedCellColumn: false,
							value: $c.find('.letter-input').val().replace(whitespaceRegex, ''),
						});
					}
				);

				acrossWord.push({
					isSelectedCellRow: rowIndex === cellPosition[1],
					isSelectedCellColumn: true,
					value: $downCell.find('.letter-input').val().replace(whitespaceRegex, ''),
				});
				
				$downCell.nextAll('.cell').each(
					function() {
						const $c = $(this);

						if ($c.hasClass('block-cell')) {
							return false;
						}

						acrossWord.push({
							isSelectedCellRow: rowIndex === cellPosition[1],
							isSelectedCellColumn: false,
							value: $c.find('.letter-input').val().replace(whitespaceRegex, ''),
						});
					}
				);

				adjacentAcrossWords.push(acrossWord);
			}
		);

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

		return DictionaryData.findByTermLengths(
			_.uniq(
				_.concat(
					[downLength, acrossLength],
					_.map(adjacentAcrossWords, 'length'),
					_.map(adjacentDownWords, 'length')
				)
			)
		).then(
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
					adjacentDownWords: adjacentDownWords,
					adjacentAcrossWords: adjacentAcrossWords,
				};


				if (_.isFunction(window.Worker)) {
					if (view._runningWorkerDeferred) {
						view._runningWorkerDeferred.reject({
							error: {
								type: USER_REPLACED_ERROR_TYPE,
								message: 'User started another _getCandidateTerms() call'
							}
						});

						delete view._runningWorkerDeferred;
					}

					if (view._runningWorker) {
						view._runningWorker.terminate();
						delete view._runningWorker;
					}

					view._runningWorkerDeferred = Q.defer();

					view._runningWorker = new window.Worker(
						URL.createObjectURL(
							new Blob([_workerContent], { type: 'text/javascript' })
						)
					);

					view._runningWorker.onmessage = function(message) {
						view._runningWorkerDeferred.resolve(message.data);

						view._runningWorker.terminate();

						delete view._runningWorkerDeferred;
						delete view._runningWorker;
					};

					view._runningWorker.postMessage(args);

					return view._runningWorkerDeferred.promise;
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
	 * @private
	 *
	 * @returns {external:Q/Promise} resolves to an object containing information about
	 * any issues with the answers, or undefined if there are no issues.
	 */
	_validateAnswers() {
		const view = this;

		let puzzle = view.generatePuzzleFromBoard();

		let acrossSolutions = {};

		let downSolutions = {};

		let across = '', down = [];

		_.each(
			puzzle.grid,
			function(row) {
				_.each(
					row,
					function(cell, cellIndex) {
						if (cell.isBlockCell) {
							if (_.size(across) > 1) {
								acrossSolutions[across] = acrossSolutions[across] || [];

								acrossSolutions[across].push({
									term: across,
									direction: 'across',
									clueNumber: 1
								});
							}

							if (_.size(down[cellIndex]) > 1) {
								downSolutions.push(down[cellIndex]);
							}

							delete down[cellIndex];

							across = '';
						}
						else if (!_.isNull(cell.solution)) {
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

	/**
	 * Hides any currently open popup displaying term options.
	 *
	 * @private
	 *
	 * @returns {module:views/puzzle-filler~PuzzleFillerView} this view
	 */
	_dismissAnswerOptionsPopup() {
		$body.find('.answer-options-dialog').remove();

		return this;
	}

	/**
	 * Describes a set of cells corresponding to a term.
	 *
	 * @typedef {object} CellSetInfo
	 *
	 * @property {string} direction - a string representing the direction of the cells; it is
	 *	either "down" or "across"
	 * @property {Number} clueNumber - the clue number for this term
	 * @property {external:jQuery} $cells - a jQuery object containing the cells for the term
	 */

	/**
	 * Generates an object mapping down and across terms to their corresponding
	 *	cell nodes.
	 *
	 * @private
	 *
	 * @returns {object} an object mapping terms to an array of {@link module:views/puzzle-filler~CellSetInfo|CellSetInfos}
	 *	that contain the term
	 */
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

							acrossTerm += $cell.find('.letter-input').val().replace(whitespaceRegex, '');
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

							downTerm += $cell.find('.letter-input').val().replace(whitespaceRegex, '');
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

	/**
	 * Handles a click of the button that persists the puzzle to storage.
	 *
	 * @private
	 */
	_handleClickKeepPuzzleButton() {
		const view = this;

		let puzzle = view.generatePuzzleFromBoard();

		localStorage.setItem('_PUZZLE', PuzzleFillerView._arrayBufferToBase64(view._puzParser.generate(puzzle)));
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
	 * Handles a click of an answer option in the popup.
	 *
	 * @private
	 *
	 * @param {event} event - the click event
	 */
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

		if (_.size(across) > 0) {
			let $firstAcrossCell = $cell.prevUntil('.block-cell').last();

			if ($firstAcrossCell.length === 0) {
				$firstAcrossCell = $cell;
			}

			$firstAcrossCell.add($firstAcrossCell.nextUntil('.block-cell')).each(
				function(index) {
					$(this).find('.letter-input').val(across[index].toUpperCase());
				}
			);
		}

		if (_.size(down) > 0) {
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
		}

		view._dismissAnswerOptionsPopup();
	}

	/**
	 * Handles a click of the button that validates the current puzzle.
	 *
	 * @private
	 */
	_handleClickValidatePuzzleButton() {
		const view = this;

		view._validateAnswers().done(
			function(report) {
				const context = {};

				if (_.isUndefined(report)) {
					context.isValid = true;
				}
				else {
					context.isValid = false;

					context.errors = {
						invalid: _.map(
							report.invalidTerms,
							term => {
								return {term};
							}
						),
						repeated: _.map(
							report.repeated,
							term => { 
								return {term};
							}
						),
						missing: _.map(
							report.missing,
							term => {
								return {term};
							}
						)
					};
				}

				$(puzzleValidationStatusDialogTemplate(context)).modal();
			}
		);
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

		var $cell = $(event.currentTarget);

		if (event.shiftKey) {
			$cell.toggleClass('block-cell crossword-cell');

			view._setCellNumbering();
		}
	}

	/**
	 * Handles a click of the button that persists the puzzle to storage.
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
	 * Converts an {@link ArrayBuffer} to a base 64 string.
	 *
	 * @private
	 *
	 * @param {ArrayBuffer} buffer - the buffer to encode
	 *
	 * @returns {string} a base 64 encoded string
	 */
	static _arrayBufferToBase64(buffer) {
		return Base64ArrayBuffer.encode(buffer);
	}

	/**
	 * Converts an {@link string} to an {@link ArrayBuffer}.
	 *
	 * @private
	 *
	 * @param {string} b64string - the base 64 decoded string
	 *
	 * @returns {ArrayBuffer} the decoded buffer
	 */
	static _base64ToArrayBuffer(b64string) {
		return Base64ArrayBuffer.decode(b64string);
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
					view._setFromPuzzle(puzzle);
				}
			);
		};

		fr.readAsArrayBuffer(file);
	}

	/**
	 * Handles a context menu being triggered on a crossword cell.
	 *
	 * @private
	 *
	 * @param {event} event - the submit event
	 */
	_handleContextmenuCrosswordCell(event) {
		const view = this;

		event.preventDefault();

		view._$findAnswersProgress.removeClass('hidden');

		view._dismissAnswerOptionsPopup();

		let $cell = $(event.currentTarget);

		$cell.removeClass('no-candidates');

		console.time('find terms');
		view._getCandidateTerms($cell).finally(
			function() {
				view._$findAnswersProgress.addClass('hidden');
			}
		).done(
			function(candidates) {
				console.timeEnd('find terms');
				console.time('render terms');
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
				console.timeEnd('render terms');

				$dialog.css({
					top: event.pageY + 'px',
					left: event.pageX + 'px'
				});

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
			},
			function(error) {
				console.log('failed to find candidates');
				console.timeEnd('find terms');
				if (error.error) {
					if (error.error.type === USER_REPLACED_ERROR_TYPE) {
						// ignore
						return;
					}
				}

				throw error;
			}
		);
	}
}

export default PuzzleFillerView;
