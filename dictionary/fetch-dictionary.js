const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");
const debug = require("debug")("xword:dictionary:fetch");

const DICTIONARY_URL = "https://raw.githubusercontent.com/adambom/dictionary/master/dictionary.json";
const JSON_FILE_PATH = path.join(__dirname, "dictionary.json");

module.exports = function fetchDictionary() {
	return fs.readFileAsync(JSON_FILE_PATH, { encoding: "utf8" }).catch(
		(err) => {
			if (err.code !== "ENOENT") {
				throw err;
			}

			return new Promise(
				(resolve, reject) => {
					const https = require("https");
					https.get(DICTIONARY_URL, (response) => {
						const file = fs.createWriteStream(JSON_FILE_PATH, { encoding: "utf8" });
						response.pipe(file).on("finish", resolve).on("error", reject);
					});
				}
			).then(
				() => fs.readFileAsync(JSON_FILE_PATH, { encoding: "utf8"})
			);
		}
	).then(
		(contents) => JSON.parse(contents)
	);
};
