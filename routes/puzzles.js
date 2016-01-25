"use strict";

var path = require('path');
var express = require('express');
var router = express.Router();
var IPUZParser = require('ipuz');

var parser = new IPUZParser();

router.get('/', function(req, res, next) {
	var puzzle = parser.parse(path.resolve(__dirname, '..', 'puzzle.ipuz'));

	res.render('puzzle', {
		title: 'Xword Gen',
		puzzle: puzzle
	});
});

module.exports = router;
