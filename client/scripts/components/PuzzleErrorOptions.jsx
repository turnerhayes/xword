import React     from "react";
import PropTypes from "prop-types";
import {
	RadioButton,
	RadioButtonGroup
}                from "material-ui/RadioButton";
import {
	ERROR_OPTIONS
}                from "project/scripts/constants";

function PuzzleErrorOptions(props) {
	return (
		<RadioButtonGroup
			valueSelected={props.errorOption}
			onChange={props.onChange}
			name="error-option"
		>
			{
				Object.keys(ERROR_OPTIONS).map(
					(key) => (
						<RadioButton
							key={key}
							value={ERROR_OPTIONS[key]}
							label={key}
						/>
					)
				)
			}
		</RadioButtonGroup>
	);
}

PuzzleErrorOptions.propTypes = {
	onChange: PropTypes.func.isRequired,
	errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
};

export default PuzzleErrorOptions;
