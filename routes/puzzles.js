"use strict";

var path = require('path');
var express = require('express');
var router = express.Router();
var IPUZParser = require('ipuz');

var parser = new IPUZParser();

router.route('/')
	.get(function(req, res, next) {
		var puzzle = parser.parse(path.resolve(__dirname, '..', 'puzzle.ipuz'));

		res.render('puzzle', {
			title: 'Xword Gen',
			puzzle: puzzle
		});
	});

router.route('/solution')
	.post(
		function(req, res, next) {
			console.log('body: ', req.body);
			var solution = req.body.solution;

			console.log('solution: ', JSON.stringify(solution, null, '\t'));

			res.send();
		}
	);

module.exports = router;
