"use strict";

const XPuz = require('xpuz');
const fs = require('fs');
const puzzle = require('../../puzzle.json');

const parser = new XPuz.PUZ();

let generated = parser.generate(puzzle);

console.log(generated);

// const Base64ArrayBuffer = require('base64-arraybuffer');
// const testObj = require('./test.json');

// fs.readFile('./test.b64', { encoding: 'utf8'}, function(err, data) {
// 	if (err) {
// 		throw err;
// 	}

// 	let obj = Base64ArrayBuffer.decode(data);

// 	console.log(obj);

// 	const puzzle = new XPuz.PUZ().parse(obj);
	
// 	console.log(puzzle);
// });



