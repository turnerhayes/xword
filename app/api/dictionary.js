import fetch      from "./fetch";
import {
	fromJS
}                 from "immutable";

export default class DictionaryAPI {
	static findTerms(searchArgs) {
		const { pattern, ...otherArgs } = searchArgs || {};
		return fetch(
			`/api/dictionary/find/${pattern}`,
			{
				query: otherArgs
			}
		).then((response) => fromJS(response.data));
	}
}
