import fetchMock from "fetch-mock";

import fetch from "./fetch";

describe("fetch wrapper", () => {
	afterEach(() => {
		fetchMock.restore();
	});

	it("should default the credentials option alone if not specified", async () => {
		expect.assertions(1);
		
		const fetchPromise = new Promise(
			(resolve) => {
				fetchMock.get("*", (url, options) => {
					resolve(options);

					return {};
				});
			}
		);

		fetch("http://example.com/example");

		const options = await fetchPromise;

		expect(options).toHaveProperty("credentials", "include");
	});

	it("should leave the credentials option alone if specified", async () => {
		expect.assertions(1);

		const fetchPromise = new Promise(
			(resolve) => {
				fetchMock.get("*", (url, options) => {
					resolve(options);

					return {};
				});
			}
		);

		const credentials = "exclude";

		fetch("http://example.com/example", {
			credentials,
		});

		const options = await fetchPromise;

		expect(options).toHaveProperty("credentials", credentials);
	});

	it("should add arrays of query values to the query string", async () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(2);

		const fetchPromise = new Promise(
			(resolve) => {
				fetchMock.get("*", (url) => {
					resolve(url);

					return {};
				});
			}
		);

		fetch("http://example.com/example", {
			query: {
				single: "value",

				foo: [
					"bar",
					"baz",
					"bax",
				],
			},
		});

		const url = await fetchPromise;

		expect(url).toMatch(/\bsingle=value\b/);
		expect(url).toMatch(/\bfoo=bar&foo=baz&foo=bax\b/);
	});
});
