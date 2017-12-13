#!/usr/bin/env node

require('../utils/read-env');
const debug = require("debug")("xword:dictionary:populate");
const fetchDictionary = require("./fetch-dictionary");
const db = require("../server/lib/persistence/db-connection");
const DictionaryItemModel = require("../server/lib/persistence/models/dictionary-item");

const MAX_RETRIES = 3;

function writeItems(operations, retries = MAX_RETRIES) {
	return DictionaryItemModel.collection.bulkWrite(
		operations,
		{
			ordered: false,
		}
	).catch(
		(err) => {
			if (retries === 0) {
				throw err;
			}

			debug(`Error writing items: ${err}\nRetrying ${retries} more times...`);

			return writeItems(operations, retries - 1);
		}
	);
}

fetchDictionary().then(
	(content) => {
		debug("Got dictionary file");
		return content;
	}
).then(
	(dictionary) => {
		const terms = Object.keys(dictionary);

		let operations = {};

		for(let i = 0, len = terms.length; i < len; i++) {
			const originalTerm = terms[i];
			let term = originalTerm;

			const matches = /(^-)?((?:[A-Z]*-?[A-Z])*)(-$)?/.exec(term);

			// Some terms have a hyphen at the beginning (-ABLY), some terms
			// have a dash at the end (AUTO-) and some have hyphens in the middle
			// (AARD-VARK). We'll discard ones with hyphens at the beginning (suffixes)
			// or at the end (prefixes), and accept hyphens in the middle but clear them
			// out. We may revisit the decision to exclude prefixes and suffixes; there are
			// some crossword answers that are prefixes or suffixes (e.g. AERO-)
			if (matches) {
				// hyphen at beginning or end
				if (matches[1] || matches[3]) {
					continue;
				}

				// Remove any non-letter character (in this dataset, that's hyphens and spaces)
				term = matches[2].replace(/[^A-Z]/g, "");
			}

			const definition = dictionary[originalTerm];

			if (definition.indexOf("[Obs.]") >= 0) {
				// Ignore obsolete definitions
				continue;
			}

			if (operations[term]) {
				// If the term already exists then add to its definitions
				operations[term].updateOne.update.definitions.push(definition);
			}
			else {
				operations[term] = {
					updateOne: {
						filter: { term },
						update: {
							term,
							definitions: [definition],
							termLength: term.length,
						},
						upsert: true,
					}
				};
			}
		}

		operations = Object.values(operations);

		debug("Inserting %d items", operations.length);

		return writeItems(operations).then(
			() => debug("Successfully inserted %d items", operations.length)
		);
	}
).finally(
	() => db.close()
);
