"use strict";

var path = require('path');
var express = require('express');
var router = express.Router();
var IPUZParser = require('xpuz');
var PUZParser = require('xpuz/parsers/puz');

var ipuzParser = new IPUZParser();
var puzParser = new PUZParser();

var puzzleMap = {
	ipuz: {
		parser: ipuzParser,
		path: path.resolve(__dirname, '..', 'puzzles', 'puzzle.ipuz')
	},
	puz: {
		parser: puzParser,
		path: path.resolve(__dirname, '..', 'puzzles', 'puzzle.puz')
	},
	rebus_puz: {
		parser: puzParser,
		path: path.resolve(__dirname, '..', 'puzzles', 'rebus_puzzle.puz')
	}
};

router.route('/create')
	.get(function(req, res, next) {
		res.render('create-puzzle', {
			title: 'Generate a puzzle',
			req: req
		});
	});

router.route('/:puzzleId')
	.get(function(req, res, next) {
		var puzzleId = req.params.puzzleId;

		if (!puzzleMap[puzzleId]) {
			throw new Error('Puzzle ID ' + puzzleId + ' not found');
		}

		puzzleMap[puzzleId].parser.parse(puzzleMap[puzzleId].path).done(
			function(puzzle) {
				res.render('puzzle', {
					title: 'Xword Gen',
					puzzle: puzzle,
					req: req
				});
			},
			function(err) {
				throw err;
			}
		);
	});

router.route('/solution')
	.post(
		function(req, res, next) {
			var solution = req.body.solution;

			console.log('solution: ', JSON.stringify(solution, null, '\t'));

			res.send();
		}
	);

module.exports = router;
