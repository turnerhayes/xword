import React from "react";
/**
 * Asynchronously loads the component for AccountDialog
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading Account Dialog</div>;

loadingMessage.displayName = "AccountDialogLoading";

const LoadableAccountDialog = Loadable({
	loader: () => import("./AccountDialog"),
	loading: loadingMessage,
});

LoadableAccountDialog.displayName = "LoadableAccountDialog";

export default LoadableAccountDialog;
