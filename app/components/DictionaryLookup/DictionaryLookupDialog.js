import React from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { withStyles }   from "@material-ui/core/styles";
import DictionaryLookup from "@app/containers/DictionaryLookup";

const styles = {
	showDropdownOutside: {
		overflow: "visible",
	},
};

function DictionaryLookupDialog(props) {
	const {
		isOpen,
		onClose,
		classes,
		...otherProps
	} = props;

	const oldOnResultChosen = otherProps.onResultChosen;

	otherProps.onResultChosen = (...args) => {
		onClose();

		return oldOnResultChosen && oldOnResultChosen(...args);
	};

	return (
		<Dialog
			open={isOpen}
			onRequestClose={onClose}
			classes={{
				paper: classes.showDropdownOutside,
			}}
		>
			<DialogContent
				className={classes.showDropdownOutside}
			>
				<DictionaryLookup
					{...otherProps}
				/>
			</DialogContent>
		</Dialog>
	);
}

DictionaryLookupDialog.propTypes = {
	...DictionaryLookup.propTypes,
	isOpen: PropTypes.bool,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
};

DictionaryLookupDialog.defaultProps = {
	isOpen: false,
};

export default withStyles(styles)(DictionaryLookupDialog);
