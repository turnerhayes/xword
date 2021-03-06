require("dotenv").config();
const path = require("path");
const Config = require("./server/lib/config");

module.exports = exports = {
	"@app": Config.paths.app,
	"@shared-lib": path.join(Config.paths.root, "shared-lib"),
};
