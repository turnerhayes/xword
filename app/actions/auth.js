function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}


export const LOGIN = "@@XWORD/AUTH/LOGIN";

export function login({ provider }) {
	const currentPage = getCurrentPagePath();

	if (provider === "facebook") {
		document.location.assign(`/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`);
	}
	else if (provider === "google") {
		document.location.assign(`/auth/google?redirectTo=${encodeURIComponent(currentPage)}`);
	}
	else if (provider === "twitter") {
		document.location.assign(`/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`);
	}
	else {
		throw new Error(`Unrecognized login provider "${provider}"`);
	}

	return {
		type: LOGIN,
	};
}

export const LOGOUT = "@@XWORD/AUTH/LOGOUT";

export function logout() {
	const currentPage = getCurrentPagePath();

	document.location.assign(`/auth/logout?redirectTo=${encodeURIComponent(currentPage)}`);

	return {
		type: LOGOUT,
	};
}
