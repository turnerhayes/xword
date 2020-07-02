import { navigateToUrl } from "@app/utils/navigation";

function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}


export const LOGIN = "@@XWORD/AUTH/LOGIN";

export function login({ provider }) {
	const currentPage = getCurrentPagePath();

	if (provider === "facebook") {
		navigateToUrl(`/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`);
	}
	else if (provider === "google") {
		navigateToUrl(`/auth/google?redirectTo=${encodeURIComponent(currentPage)}`);
	}
	else if (provider === "twitter") {
		navigateToUrl(`/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`);
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

	navigateToUrl(`/auth/logout?redirectTo=${encodeURIComponent(currentPage)}`);

	return {
		type: LOGOUT,
	};
}
