// needed for regenerator-runtime
// (ES7 generator support is required by redux-saga)
import "babel-polyfill";

// Allow use of Enzyme matchers
import "jest-enzyme";

// Provides window.fetch (which can then be mocked by fetch-mock)
import "isomorphic-fetch";
