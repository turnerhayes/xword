const exec = require("child_process").exec;

const MINIMUM_NODE_MAJOR_VERSION = 3;

exec("npm -v", function (err, stdout) {
	if (err) {
		throw err;
	}

	if (parseFloat(stdout) < MINIMUM_NODE_MAJOR_VERSION) {
		throw new Error(`[ERROR: React Boilerplate] You need npm version @>=${MINIMUM_NODE_MAJOR_VERSION}`);
	}
});
