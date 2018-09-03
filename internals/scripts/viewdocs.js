#!/usr/bin/env node

const path = require("path");
const opn = require("opn");
const { name, version } = require("../../package.json");

opn(path.resolve(__dirname, "..", "..", "docs", name, version, "index.html"));
