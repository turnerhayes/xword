import {
	fromJS
}            from "immutable";
import fetch from "./fetch";

function throwError(err, status) {
	const error = new Error(err.message);
	error.error = err;
	error.status = status;
	throw error;
}

function processResponse(response) {
	return response.json().then(
		(json) => {
			if (!response.ok) {
				throwError(json.error, response.status);
			}

			return fromJS(json);
		}
	);
}

export function getUser({ userID }) {
	return fetch(`/api/users/${userID}`)
		.then(processResponse);
}

export function getUsers({ userIDs }) {
	return fetch(
		"/api/users",
		{
			query: {
				ids: userIDs.join(","),
			}
		}
	).then(processResponse);
}
