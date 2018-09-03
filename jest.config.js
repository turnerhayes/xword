module.exports = exports = {
	collectCoverageFrom: [
		"app/**/*.js",
		"!app/**/*.test.js",
		"!app/*/RbGenerated*/*.js",
		"!app/app.js",
		"!app/*/*/Loadable.js",
		"!app/fonts/**",
	],
	coverageThreshold: {
		global: {
			statements: 98,
			branches: 91,
			functions: 98,
			lines: 98
		}
	},
	moduleDirectories: [
		"node_modules",
		"app"
	],
	moduleNameMapper: {
		".*\\.(css|less|styl|scss|sass)$": "<rootDir>/internals/mocks/cssModule.js",
		".*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/internals/mocks/image.js"
	},
	setupFiles: [
		"<rootDir>/internals/testing/shim.js",
		"<rootDir>/internals/testing/setup.js",
	],
	setupTestFrameworkScriptFile: "<rootDir>/internals/testing/test-bundler.js",
	testRegex: ".*\\.test\\.js$",
	resolver: "./internals/jest-resolver",
	testEnvironment: "jsdom",
};
