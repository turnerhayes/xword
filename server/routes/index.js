"use strict";

const express = require("express");
const router  = express.Router();

router.route("/")
	.get((req, res) => res.render(
		"index",
		{
			title: "Xword Gen",
			req: req
		}
	)
);

exports = module.exports = router;
