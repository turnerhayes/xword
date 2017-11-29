import { Map }                 from "immutable";
import { connect }             from "react-redux";
import PropTypes               from "prop-types";
import PuzzleGeneratorControls from "project/scripts/components/PuzzleGeneratorControls";
import { setUIState }          from "project/scripts/redux/actions";

const PuzzleGeneratorControlsContainer = connect(
	function mapStateToProps(state, ownProps) {
		const props = {};

		let uiState = state.get("ui");

		if (uiState && uiState.isRehydrated) {
			uiState = uiState.get(ownProps.uiSection);
		}

		uiState = uiState || Map();

		props.currentDirection = uiState.get("currentDirection");

		props.uiWidth = uiState.get("width");
		if (props.uiWidth === null) {
			props.uiWidth = ownProps.width;
		}

		props.uiHeight = uiState.get("height");
		if (props.uiHeight === null) {
			props.uiHeight = ownProps.height;
		}

		return props;
	},
	function mapDispatchToProps(dispatch, ownProps) {
		return {
			onDimensionChange({ dimension, value }) {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: {
						[dimension]: value,
					}
				}));
			},

			onDirectionChange({ direction }) {
				dispatch(setUIState({
					section: ownProps.uiSection,
					settings: {
						currentDirection: direction,
					}
				}));
			},
		};
	}
)(PuzzleGeneratorControls);

PuzzleGeneratorControlsContainer.propTypes = {
	uiSection: PropTypes.string.isRequired,
};

PuzzleGeneratorControlsContainer.displayName = "PuzzleGeneratorControlsContainer";

export default PuzzleGeneratorControlsContainer;
