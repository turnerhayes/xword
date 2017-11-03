import React from "react";
import PropTypes from "prop-types";
import {
	Toolbar,
	ToolbarGroup
}            from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import                 "project/styles/puzzle-generator-controls.less";

function PuzzleGeneratorControls(props) {
	return (
		<Toolbar
			className="c_puzzle-generator-controls"
		>
			<ToolbarGroup
			>
				<IconButton
					iconClassName="fa fa-eraser"
					tooltip="Clear puzzle"
					onClick={() => props.onClearPuzzle && props.onClearPuzzle()}
				/>
				<IconButton
					iconClassName={`fa fa-square${props.shouldPlaceBlocks ? "" : "-o"}`}
					tooltip={`Place ${props.shouldPlaceBlocks ? "block" : "input"} cells`}
					onClick={() => props.onShouldPlaceBlocksChange && props.onShouldPlaceBlocksChange()}
				/>
			</ToolbarGroup>
		</Toolbar>
	);
}

PuzzleGeneratorControls.propTypes = {
	onClearPuzzle: PropTypes.func,
	onShouldPlaceBlocksChange: PropTypes.func,
	shouldPlaceBlocks: PropTypes.bool,
};

export default PuzzleGeneratorControls;
