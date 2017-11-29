import React     from "react";
import PropTypes from "prop-types";
import Radio, {
	RadioGroup
}                from "material-ui/Radio";
import {
	FormControlLabel
} from "material-ui/Form";
import {
	ERROR_OPTIONS
}                from "project/scripts/constants";

function PuzzleErrorOptions(props) {
	return (
		<RadioGroup
			value={props.errorOption}
			onChange={(event, value) => props.onChange && props.onChange({ errorOption: value })}
			name="error-option"
		>
			{
				Object.keys(ERROR_OPTIONS).map(
					(key) => (
						<FormControlLabel
							key={key}
							value={ERROR_OPTIONS[key] || ""}
							control={<Radio />}
							label={key}
						/>
					)
				)
			}
		</RadioGroup>
	);
}

PuzzleErrorOptions.propTypes = {
	onChange: PropTypes.func.isRequired,
	errorOption: PropTypes.oneOf(Object.values(ERROR_OPTIONS)),
};

export default PuzzleErrorOptions;
