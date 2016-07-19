#!/usr/bin/env node

// Parses Webster's Dictionary from Project Gutenberg (at https://www.gutenberg.org/ebooks/29765)

"use strict";

var _        = require('lodash');
var path     = require('path');
var fs       = require('fs');
var readline = require('readline');

var filePath = path.resolve(__dirname, 'dictionary.txt');

var reader = readline.createInterface({
	input: fs.createReadStream(filePath)
});

var re_defn = /^Defn: /;

var re_word = /^[A-Z]{2,}$/;

var re_space = /^\s*$/;

var word;

var definition;

var definitions = {};

reader.on('line', function(line) {
	if (!word && re_word.test(line)) {
		word = line;
		return;
	}

	if (word && re_defn.test(line)) {
		definition = line.replace(re_defn, '');
		return;
	}

	if (
		re_space.test(line) &&
		!_.isUndefined(word) && !_.isUndefined(definition)
	) {
		var obj = {};

		obj[word] = definition;

		if (!(word in definitions)) {
			definitions[word] = {
				term: word,
				termLength: _.size(word),
				definitions: []
			};
		}

		definitions[word].definitions.push(definition);

		word = undefined;
		definition = undefined;
		return;
	}

	if (!_.isUndefined(definition)) {
		definition += ' ' + line;
	}
});

reader.on('close', function() {
	console.log(JSON.stringify(_.values(definitions)));
});


// fs.readFile(
// 	filePath,
// 	{
// 		encoding: 'utf8'
// 	},
// 	function(err, txt) {
// 		if (err) {
// 			throw new Error('Error reading file: ' + err.message);
// 		}

// 		// console.log(txt.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
// 		// return;

// 		var lines = txt.split(/\n\n/);

// 		var i, j, len, startLine;

// 		var term;

// 		var defnLines = [];

// 		for (i = 0, len = lines.length; i < len; i++) {
// 			if (lines[i] === '====START') {
// 				startLine = i + 1;
// 				continue;
// 			}

// 			if (!_.isUndefined(startLine)) {
// 				console.log('line: "' + lines[i] + '"');
// 				if (
// 					/^[A-Z]{2,}$/.test(lines[i])
// 				) {
// 					console.log('is a term');
// 					var obj = {};

// 					var term = lines[i];

// 					for (; i < len; i++) {
// 						if (re_defn.test(lines[i])) {
// 							obj[term] = lines[i].replace(re_defn, '');

// 							defnLines.push(obj);
// 						}
// 					}
// 				}

// 				// if (re_defn.test(lines[i])) {
// 				// 	for (j = i - 1; j >= 0; j--) {
// 				// 		if (/^[A-Za-z]+/.test(lines[j]) && !re_defn.test(lines[j])) {
// 				// 			term = (lines[j].split('\n'))[0];
// 				// 			break;
// 				// 		}
// 				// 	}

// 				// 	var obj = {};

// 				// 	obj[term] = lines[i].replace(/\n/g, ' ').replace(re_defn, '');

// 				// 	defnLines.push(obj);
// 				// }
// 			}
// 		}

// 		// lines = _.slice(lines, i + 1);

// 		// console.log(lines);
// 		console.log(defnLines);
// 	}
// );
