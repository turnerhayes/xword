/* global Promise */

// No need to build the DLL in production
if (process.env.NODE_ENV === "production") {
	process.exit(0);
}

const path = require("path");
const fs = require("fs");
const exists = fs.existsSync;
const writeFile = fs.writeFileSync;
const mkdirp = require("mkdirp");
const { echo, exec } = require("shelljs");

const defaults = require("lodash/defaultsDeep");
const pkg = require(path.join(process.cwd(), "package.json"));
const config = require("../config");
const dllConfig = defaults(pkg.dllPlugin, config.dllPlugin.defaults);
const outputPath = path.join(process.cwd(), dllConfig.path);
const dllManifestPath = path.join(outputPath, "package.json");

/**
 * I use node_modules/xword-dlls by default just because
 * it isn't going to be version controlled and babel wont try to parse it.
 */
new Promise(
	(resolve, reject) => {
		mkdirp(outputPath, (err) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	}
).then(
	() => {
		echo("Building the Webpack DLL...");

		/**
		 * Create a manifest so npm install doesn't warn us
		 */
		if (!exists(dllManifestPath)) {
			writeFile(
				dllManifestPath,
				JSON.stringify(defaults({
					name: "xword-webpack-dlls",
					private: true,
					author: pkg.author,
					repository: pkg.repository,
					version: pkg.version,
				}), null, "  "),
				"utf8"
			);
		}

		// the BUILDING_DLL env var is set to avoid confusing the development environment
		exec("cross-env BUILDING_DLL=true webpack --display-chunks --color --config internals/webpack/webpack.dll.babel.js --hide-modules");		
	}
);

