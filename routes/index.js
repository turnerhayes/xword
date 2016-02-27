"use strict";

var express = require('express');
var router = express.Router();

router.route('/')
	.get(function(req, res, next) {
		res.render(
			'index',
			{
				title: 'Xword Gen',
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
			}
		);
	}
);

module.exports = router;
