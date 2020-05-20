import React     from "react";
import PropTypes from "prop-types";
import Radio            from "@material-ui/core/Radio";
import RadioGroup       from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {
	ERROR_OPTIONS
}                from "@app/constants";

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
