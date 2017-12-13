import axios      from "axios";
import {
	fromJS
}                 from "immutable";

export default class DictionaryUtils {
	static findTerms(searchArgs) {
		const { pattern, ...otherArgs } = searchArgs || {};
		return axios.get(
			`/api/dictionary/find/${pattern}`,
			{
				data: otherArgs
			}
		).then((response) => fromJS(response.data));
	}
}
