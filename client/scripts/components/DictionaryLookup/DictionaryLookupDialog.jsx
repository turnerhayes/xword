import React from "react";
import PropTypes from "prop-types";
import Dialog, {
	DialogContent
}                              from "material-ui/Dialog";
import DictionaryLookup from "project/scripts/containers/DictionaryLookup";
import getClassHelper   from "project/scripts/classes";
import                       "./DictionaryLookupDialog.less";

const classes = getClassHelper("dictionary-lookup-dialog");

export default function DictionaryLookupDialog(props) {
	const {
		isOpen,
		onClose,
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
				root: classes().className,
				paper: classes({
					element: "paper",
				}).className,
			}}
		>
			<DialogContent
				{...classes({
					element: "content"
				})}
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
	onClose: PropTypes.func.isRequired,
};
