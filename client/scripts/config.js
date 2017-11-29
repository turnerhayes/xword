/* global process */

import sharedConfig from "project/shared-lib/config";

sharedConfig.auth = sharedConfig.auth || {};

[
	["facebook", process.env.CREDENTIALS_FACEBOOK_IS_ENABLED],
	["google", process.env.CREDENTIALS_GOOGLE_IS_ENABLED],
	["twitter", process.env.CREDENTIALS_TWITTER_IS_ENABLED],
].forEach(
	([authID, isEnabled]) => sharedConfig.auth[authID] = { isEnabled }
);

export default sharedConfig;
