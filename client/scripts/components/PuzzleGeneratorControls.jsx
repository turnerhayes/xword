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
			</ToolbarGroup>
		</Toolbar>
	);
}

PuzzleGeneratorControls.propTypes = {
	onClearPuzzle: PropTypes.func,
};

export default PuzzleGeneratorControls;
