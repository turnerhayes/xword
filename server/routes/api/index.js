"use strict";

const express = require("express");

const router = express.Router();

router.use("/users", require("./users"));

router.use("/dictionary", require("./dictionary"));

exports = module.exports = router;
