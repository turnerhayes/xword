"use strict";

process.env.DATA_DB_URI            = process.env.DATA_DB_URI || process.env.MONGOLAB_URI;
process.env.SESSION_DB_URI         = process.env.DATA_DB_URI;
process.env.USE_ENVIRONMENT_CONFIG = true;
process.env.LOGGING_USE_CONSOLE    = 1;
