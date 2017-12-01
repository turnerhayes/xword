const path = require("path");

require("dotenv-expand")(require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") }));
