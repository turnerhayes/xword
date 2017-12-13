import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Select             from "react-select";
import Dropzone           from "react-dropzone";
import Icon               from "material-ui/Icon";
import Button             from "material-ui/Button";
import {
	Parsers,
	ImmutablePuzzle
}                         from "xpuz";
import                         "react-select/dist/react-select.css";
import                         "font-awesome/less/font-awesome.less";
import                         "./PuzzlePicker.less";

function handleFileUpload(props, files) {
	const file = files && files[0];

	if (!file) {
		return;
	}

	const reader = new window.FileReader();

	reader.onload = (event) => {
		(new Parsers.PUZ()).parseImmutable(event.target.result).then(
			(puzzle) => props.onUploadSuccess({ puzzle })
		).catch(
			(error) => props.onUploadFailure && props.onUploadFailure(error)
		);
	};

	reader.readAsArrayBuffer(file);
}

function handlePuzzleSelected({ props, value }) {
	props.onPuzzleSelected && props.onPuzzleSelected({
		index: value,
		puzzle: props.existingPuzzles.get(value),
	});
}

function PuzzlePicker(props) {
	return (
		<div
			className="c_puzzle-picker"
		>
			<Dropzone
				className="c_puzzle-picker--dropzone"
				onDrop={(files) => handleFileUpload(props, files)}
			>
				<Button
				>
					<Icon className="icon">upload</Icon>
					Upload a .puz file
				</Button>
			</Dropzone>
			{
				props.existingPuzzles && !props.existingPuzzles.isEmpty() && (
					<label
						className="c_puzzle-picker--puzzle-selector-label"
					>
						<span
						>
							Choose a puzzle: 
						</span>
						<Select
							className="c_puzzle-picker--puzzle-selector"
							value={props.currentPuzzleIndex}
							onChange={(selected) => handlePuzzleSelected({ props, value: selected ? selected.value : null })}
							options={props.existingPuzzles.map(
								(puzzle, index) => ({
									value: index,
									label: puzzle.info.get("title") || `Puzzle ${index + 1}`,
								})
							).toJS()}
						/>
					</label>
				)
			}
		</div>
	);
}

PuzzlePicker.propTypes = {
	existingPuzzles: ImmutablePropTypes.listOf(PropTypes.instanceOf(ImmutablePuzzle)),
	currentPuzzleIndex: PropTypes.number,
	onUploadSuccess: PropTypes.func.isRequired,
	onUploadFailure: PropTypes.func,
	onPuzzleSelected: PropTypes.func,
	label: PropTypes.string,
};

export default PuzzlePicker;
