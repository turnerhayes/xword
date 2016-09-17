"use strict";

var path = require('path');
var express = require('express');
var router = express.Router();
var IPUZParser = require('xpuz').IPUZ;
var PUZParser = require('xpuz').PUZ;

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

router.route('/play')
	.get(function(req, res, next) {
		res.render('puzzle-list', {
			title: 'Do a puzzle',
			req: req,
			puzzles: [
				{
					id: 'ipuz',
					name: 'ipuz puzzle'
				},
				{
					id: 'puz',
					name: 'puz puzzle'
				},
				{
					id: 'rebus_puz',
					name: 'rebus puz puzzle'
				}
			]
		});
	});



router.route('/fill')
	.get(
		function(req, res) {
			res.render('fill-puzzle', {
				title: 'Fill a puzzle',
				req: req
			});
		}
	);


router.route('/import')
	.get(
		function(req, res) {
			res.render('play-imported-puzzle', {
				title: 'Play an imported puzzle',
				req: req
			});
		}
	);

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
