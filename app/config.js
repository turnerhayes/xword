/* global process */

import merge from "lodash.merge";
import sharedConfig from "@shared-lib/config";

export default merge(
	sharedConfig,
	{
		auth: {
			facebook: {
				isEnabled: process.env.CREDENTIALS_FACEBOOK_IS_ENABLED
			},
			google: {
				isEnabled: process.env.CREDENTIALS_GOOGLE_IS_ENABLED
			},
			twitter: {
				isEnabled: process.env.CREDENTIALS_TWITTER_IS_ENABLED
			}
		}
	}
);
