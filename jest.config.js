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
		".*\\.(css|less|styl|scss|sass)$": "<rootDir>/jest/mocks/cssModule.js",
	},
	setupFiles: [
		"<rootDir>/jest/setup.js",
		"fake-indexeddb/auto",
	],
	setupFilesAfterEnv: [
		"<rootDir>/jest/test-bundler.js",
	],
	testRegex: ".*\\.test\\.js$",
	resolver: "./jest/jest-resolver",
	testEnvironment: "jsdom",
};
