import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	FormGroup,
}                         from "material-ui/Form";
import Button             from "material-ui/Button";
import TextField          from "material-ui/TextField";
import List, { ListItem } from "material-ui/List";
import Icon               from "material-ui/Icon";
import getClassHelper     from "project/scripts/classes";
import                         "./DictionaryLookup.less";

const classes = getClassHelper("dictionary-lookup");


export default class DictionaryLookup extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		termLength: PropTypes.number.isRequired,
		pattern: PropTypes.string,
		findResults: ImmutablePropTypes.listOf(
			ImmutablePropTypes.map
		),
		onPatternChange: PropTypes.func.isRequired,
		onSearch: PropTypes.func.isRequired,
	}

	handleSubmit = (event) => {
		event.preventDefault();

		const {
			pattern,
		} = this.props;

		const searchArgs = {
			pattern,
		};

		this.props.onSearch(searchArgs);
	}

	onPatternChange(pattern) {
		pattern = pattern.toUpperCase();

		this.props.onPatternChange({ pattern });
	}

	handlePatternKeyDown = (event) => {
		if (/^[^A-Za-z]$/.test(event.key)) {
			event.preventDefault();
		}
	}

	render() {
		let pattern = this.props.pattern;

		const {
			termLength,
			className,
			findResults,
		} = this.props;

		pattern = pattern || "";

		const patternLength = pattern.length;

		if (pattern.length < termLength) {
			pattern = [pattern];

			for (let i = 0; i < termLength - patternLength; i++) {
				pattern.push("_");
			}

			pattern = pattern.join("");
		}

		return (
			<div
				{...classes({
					extra: className,
				})}
			>
				<form
					method="GET"
					onSubmit={this.handleSubmit}
				>
					<FormGroup
					>
						<TextField
							inputClassName={classes({
								element: "pattern-input",
							}).className}
							inputProps={{
								minLength: termLength,
							}}
							label="Pattern"
							value={pattern}
							helperText={`
								Use underscores to represent any character;
								for instance, "FA_L" will match both "FALL" and "FAIL"
							`}
							onKeyDown={this.handlePatternKeyDown}
							onChange={(event) => this.onPatternChange(event.target.value)}
						/>
					</FormGroup>
					<Button
						color="primary"
						type="submit"
					>
						Search
						<Icon
							className="icon"
						>search</Icon>
					</Button>
				</form>
				{
					findResults && (
						<div
							{...classes({
								element: "find-results",
							})}
						>
							{
								findResults.isEmpty() ?
									"No results" :
									(
										<List>
										{
											findResults.map(
												(result) => (
													<ListItem
														key={result.get("id")}
														button
													>
														{result.get("term")}
													</ListItem>
												)
											).toArray()
										}
										</List>
									)
							}
						</div>
					)
				}
			</div>
		);
	}
}

