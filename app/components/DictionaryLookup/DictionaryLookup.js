import React              from "react";
import { is } from "immutable";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Autocomplete       from "react-autocomplete";
import classnames         from "classnames";
import { withStyles }     from "@material-ui/core/styles";
import FormGroup          from "@material-ui/core/FormGroup";
import Typography         from "@material-ui/core/Typography";
import Button             from "@material-ui/core/Button";
import TextField          from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Icon               from "@material-ui/core/Icon";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import StepLabel from "@material-ui/core/StepLabel";
// import                         "react-select/dist/react-select.css";

const styles = {
	patternInput: {
		letterSpacing: "0.4em",
	},
};

class DictionaryLookup extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		classes: PropTypes.object.isRequired,
		currentFill: ImmutablePropTypes.listOf(PropTypes.string),
		pattern: PropTypes.string,
		selectedResult: ImmutablePropTypes.map,
		customClue: PropTypes.string,
		termSearch: ImmutablePropTypes.mapContains({
			searchArgs: ImmutablePropTypes.map,
			results: ImmutablePropTypes.listOf(
				ImmutablePropTypes.map
			),
		}),
		onPatternChange: PropTypes.func.isRequired,
		onTermClicked: PropTypes.func.isRequired,
		onResultChosen: PropTypes.func.isRequired,
		onCustomClueChange: PropTypes.func,
		onSearch: PropTypes.func.isRequired,
	}

	state = {
		clueInputEl: null,
	}

	patternFromFill = (currentFill) => {
		return currentFill.map(
			(solution) => solution || "_"
		).join("");
	}

	constructor(props) {
		super(...arguments);

		props.onPatternChange({
			pattern: this.patternFromFill(props.currentFill),
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentFill && !is(nextProps.currentFill, this.props.currentFill)) {
			this.props.onPatternChange({
				pattern: this.patternFromFill(nextProps.currentFill),
			});
		}
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

	onPatternChange = (event) => {
		const pattern = event.target.value.toUpperCase();

		this.props.onPatternChange({ pattern });
	}

	handlePatternKeyDown = (event) => {
		if (/^[^A-Za-z_]$/.test(event.key)) {
			event.preventDefault();
		}
	}

	handleTermClicked = (result) => {
		this.props.onTermClicked({ result });
	}

	handleClueChosen = ({ term, clue }) => {
		this.props.onResultChosen({
			term,
			clue,
		});
	}

	handleCustomClueChanged = ({ clue }) => {
		this.props.onCustomClueChange && this.props.onCustomClueChange({
			clue,
		});
	}

	renderResult = (result) => {
		return (
			<ListItem
				key={result.get("id")}
				button
				onClick={() => this.handleTermClicked(result)}
			>
				<ListItemText
					primary={result.get("term")}
				/>
			</ListItem>
		);
	}

	renderSearchStep = () => {
		const {
			currentFill,
			termSearch,
			pattern,
			className,
			classes,
		} = this.props;

		return (
			<div>
				<form
					method="GET"
					onSubmit={this.handleSubmit}
				>
					<FormGroup
					>
						<TextField
							inputClassName={classnames(
								classes.patternInput,
								className
							)}
							inputProps={{
								minLength: currentFill.size,
							}}
							label="Pattern"
							value={pattern}
							helperText={`
								Use underscores to represent any character;
								for instance, "FA_L" will match both "FALL" and "FAIL"
							`}
							placeholder="Search pattern"
							onKeyDown={this.handlePatternKeyDown}
							onChange={this.onPatternChange}
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
					termSearch && (
						<div>
							{
								termSearch.get("results").isEmpty() ?
									"No results" :
									(
										<List>
											{
												termSearch.get("results").map(
													this.renderResult
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

	renderClueStep = () => {
		const {
			selectedResult,
			customClue,
		} = this.props;

		return (
			<div>
				<Typography
					type="display2"
				>{selectedResult.get("term")}</Typography>
				<Autocomplete
					wrapperStyle={{
						position: "relative",
						zIndex: 1,
					}}
					getItemValue={(clue) => clue}
					items={selectedResult.get("definitions").toArray()}
					renderInput={(fieldProps) => {
						const {
							ref,
							...otherProps
						} = fieldProps;

						return (
							<TextField
								multiline
								fullWidth
								inputRef={ref}
								inputProps={otherProps}
							/>
						);
					}}
					renderMenu={(items, value, style) => (
						<div
							style={{
								...style,
								position: "fixed",
								backgroundColor: "white",
							}}
						>
							<List
							>
								{items}
							</List>
						</div>
					)}
					renderItem={(clue, isHighlighted, styles) => (
						<ListItem
							key={clue}
							button
							{...styles}
						>{clue}</ListItem>
					)}
					value={customClue}
					onChange={(event) => this.handleCustomClueChanged({ clue: event.target.value })}
					onSelect={(clue) => this.handleCustomClueChanged({ clue })}
				/>
				<div
				>
					<Button
						color="primary"
						disabled={!customClue}
						onClick={() => this.handleClueChosen({
							term: selectedResult.get("term"),
							clue: customClue,
						})}
					>
						Use Clue
					</Button>
					<Button
						onClick={() => this.handleClueChosen({
							term: selectedResult.get("term"),
							clue: null,
						})}
					>
						Skip
					</Button>
					<Button
						onClick={() => this.handleTermClicked(null)}
					>
						Back
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const {
			className,
			pattern,
			selectedResult,
		} = this.props;

		if (!pattern) {
			return null;
		}

		return (
			<div
				className={className}
			>
				<Stepper
					activeStep={selectedResult ? 1 : 0}
				>
					<Step>
						<StepButton
							onClick={() => this.handleTermClicked(null)}
							completed={!!selectedResult}
						>Search for Terms</StepButton>
					</Step>
					<Step>
						<StepLabel
						>Choose a Clue</StepLabel>
					</Step>
				</Stepper>
				{
					selectedResult ?
						this.renderClueStep() :
						this.renderSearchStep()
				}
			</div>
		);
	}
}

export default withStyles(styles)(DictionaryLookup);
