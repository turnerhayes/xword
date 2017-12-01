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

		const operations = [];

		for(let i = 0, len = terms.length; i < len; i++) {
			const definition = dictionary[terms[i]];

			if (definition.indexOf("[Obs.]") >= 0) {
				// Ignore obsolete definitions
				continue;
			}

			operations.push({
				updateOne: {
					filter: {term: terms[i]},
					update: {
						term: terms[i],
						definitions: [definition],
						termLength: terms[i].length,
					},
					upsert: true,
				}
			});
		}

		debug("Inserting %d items", operations.length);

		return writeItems(operations).then(
			() => debug("Successfully inserted %d items", operations.length)
		);
	}
).finally(
	() => db.close()
);
