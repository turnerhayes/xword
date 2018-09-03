import React from "react";
/**
 * Asynchronously loads the component for HomePage
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading page</div>;

loadingMessage.displayName = "HomePageLoading";

export default Loadable({
	loader: () => import("./HomePage"),
	loading: loadingMessage,
});