import PropTypes from "prop-types";
import DictionaryLookupDialog from "@app/components/DictionaryLookup/DictionaryLookupDialog";
import { connect } from "react-redux";
import {
	setUIState,
}                       from "@app/actions";

const DictionaryLookupDialogContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};
		const uiState = state.getIn(["ui", ownProps.uiSection, "DictionaryLookup"]);

		if (uiState) {
			props.isOpen = !!uiState.get("isOpen");
			props.selectedResult = uiState.get("selectedResult");
		}

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		return {
			onClose() {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: {
						DictionaryLookup: undefined,
					},
				}));

				ownProps.onClose && ownProps.onClose();
			},
		};
	}
)(DictionaryLookupDialog);

DictionaryLookupDialogContainer.propTypes = {
	sectionName: PropTypes.string,
};

DictionaryLookupDialogContainer.displayName = "DictionaryLookupDialogContainer";

export default DictionaryLookupDialogContainer;
