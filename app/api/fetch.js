function getQueryParams(query) {
	const queryParams = new URLSearchParams();

	for (let key in query) {
		if (Array.isArray(query[key])) {
			query[key].forEach((value) => queryParams.append(key, value));
		}
		else {
			queryParams.append(key, query[key]);
		}
	}

	return queryParams;
}

export default function fetch(url, options) {
	options = options || {};

	if (!("credentials" in options)) {
		options.credentials = "include";
	}

	if (options.query) {
		url += `?${getQueryParams(options.query)}`;
		delete options.query;
	}

	return window.fetch(url, options);
}
