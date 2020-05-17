import React              from "react";
import PropTypes          from "prop-types";
import { is }             from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";
import Select             from "react-select";
import Dropzone           from "react-dropzone";
import Icon               from "@material-ui/core/Icon";
// import Button             from "@material-ui/core/Button";
import { withStyles }     from "@material-ui/core/styles";
import {
	Puzzle,
	Parsers
}                         from "xpuz/immutable";

const puzParser = new Parsers.PUZ();

const styles = {
	dropzone: {
		display: "inline-block",
		marginRight: "2em",
	},

	puzzleSelectorLabel: {
		display: "inline-flex",
		flexDirection: "row",
		alignItems: "center",
	},

	puzzleSelector: {
		width: "10em",
		marginLeft: "1em",
	},
};

class PuzzlePicker extends React.PureComponent {
	handleFileUpload = (files) => {
		const file = files && files[0];

		if (!file) {
			return;
		}

		const reader = new window.FileReader();

		reader.onload = (event) => {
			puzParser.parse(event.target.result).then(
				(puzzle) => this.props.onUploadSuccess({ puzzle })
			).catch(
				(error) => this.props.onUploadFailure && this.props.onUploadFailure(error)
			);
		};

		reader.readAsArrayBuffer(file);
	}

	handlePuzzleSelected = (selected) => {
		const index = selected ? this.props.existingPuzzles.indexOf(selected) : null;

		this.props.onPuzzleSelected && this.props.onPuzzleSelected({
			index,
			puzzle: index === null ? null : this.props.existingPuzzles.get(index),
		});
	}

	getOptionLabel = (option) => {
		let label = option.getIn(["info", "title"]);

		if (!label) {
			const index = this.props.existingPuzzles.indexOf(option);

			label = `Puzzle ${index}`;
		}

		return label;
	}

	isOptionSelected = (option) => {
		return is(option, this.props.existingPuzzles.get(this.props.currentPuzzleIndex));
	}

	render() {
		return (
			<div
				className="c_puzzle-picker"
			>
				<Dropzone
					className={this.props.classes.dropzone}
					onDrop={this.handleFileUpload}
				>
					{({getRootProps, getInputProps}) => (
						<label {...getRootProps()}>
							<Icon className="icon">upload</Icon>
							<input type="file" {...getInputProps()} />
							Upload a .puz file
						</label>
					)}
				</Dropzone>
				{
					this.props.existingPuzzles && this.props.existingPuzzles.size > 1 && (
						<label
							className={this.props.classes.puzzleSelectorLabel}
						>
							<span
							>
								Choose a puzzle: 
							</span>
							<Select
								className={this.props.classes.puzzleSelector}
								value={this.props.existingPuzzles.get(this.props.currentPuzzleIndex)}
								onChange={this.handlePuzzleSelected}
								options={this.props.existingPuzzles.toArray()}
								getOptionLabel={this.getOptionLabel}
								isOptionSelected={this.isOptionSelected}
							/>
						</label>
					)
				}
			</div>
		);
	}
}

PuzzlePicker.propTypes = {
	classes: PropTypes.object.isRequired,
	existingPuzzles: ImmutablePropTypes.listOf(PropTypes.instanceOf(Puzzle)),
	currentPuzzleIndex: PropTypes.number,
	onUploadSuccess: PropTypes.func.isRequired,
	onUploadFailure: PropTypes.func,
	onPuzzleSelected: PropTypes.func,
	label: PropTypes.string,
};

export default withStyles(styles)(PuzzlePicker);
