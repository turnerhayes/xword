import React      from "react";
import PropTypes  from "prop-types";
import classnames from "classnames";
import {
	Puzzle
}                 from "xpuz/immutable";
import { withStyles } from "@material-ui/core/styles";

const styles = {
	root: {
		display: "flex",
		flexDirection: "row",
	},

	clueListContainer: {
		flex: 1,
	},

	highlightedClueItem: {
		backgroundColor: "#FFFF00",
	},
};

function CrosswordClues(props) {
	return (
		<div
			className={props.classes.root}
		>
			<div
				className={props.classes.clueListContainer}
			>
				<h3
					className="c_crossword-clues--across-list--header"
				>
				Across
				</h3>
				<ol
					className="c_crossword-clues--across-list"
				>
					{
						props.puzzle.clues.get("across").map(
							(clueText, clueNumber) => {
								return (
									<li
										key={clueNumber}
										value={clueNumber}
										className={classnames(
											{
												[props.classes.highlightedClueItem]: props.selectedClueNumber &&
													props.currentDirection === "across" &&
													props.selectedClueNumber === clueNumber
											}
										)}
									>
										{clueText}
									</li>
								);
							}
						).toArray()
					}
				</ol>
			</div>
			<div
				className={props.classes.clueListContainer}
			>
				<h3
				>
				Down
				</h3>
				<ol
				>
					{
						props.puzzle.clues.get("down").map(
							(clueText, clueNumber) => {
								return (
									<li
										key={clueNumber}
										value={clueNumber}
										className={classnames(
											{
												[props.classes.highlightedClueItem]: props.selectedClueNumber &&
													props.currentDirection === "across" &&
													props.selectedClueNumber === clueNumber
											}
										)}
									>
										{clueText}
									</li>
								);
							}
						).toArray()
					}
				</ol>
			</div>
		</div>
	);
}

CrosswordClues.propTypes = {
	classes: PropTypes.object.isRequired,
	puzzle: PropTypes.instanceOf(Puzzle).isRequired,
	selectedClueNumber: PropTypes.number,
	currentDirection: PropTypes.oneOf([
		"across",
		"down",
	]),
};

export default withStyles(styles)(CrosswordClues);
