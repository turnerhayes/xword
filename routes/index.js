"use strict";

var express = require('express');
var router = express.Router();

router.route('/')
	.get(function(req, res, next) {
		res.render(
			'index',
			{
				title: 'Xword Gen',
				req: req
			}
		);
	}
);

module.exports = router;
