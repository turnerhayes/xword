import React      from "react";
import PropTypes  from "prop-types";
import classnames from "classnames";
import {
	ImmutablePuzzle
}                 from "xpuz";
import                 "project/styles/crossword-clues.less";

function CrosswordClues(props) {
	return (
		<div
			className="c_crossword-clues"
		>
			<div
				className="c_crossword-clues--across-list-container clue-list-container"
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
											"c_crossword-clues--across-list--clue clue-item",
											{
												"is-highlighted": props.selectedClueNumber &&
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
				className="c_crossword-clues--down-list-container clue-list-container"
			>
				<h3
					className="c_crossword-clues--down-list--header"
				>
				Down
				</h3>
				<ol
					className="c_crossword-clues--down-list"
				>
					{
						props.puzzle.clues.get("down").map(
							(clueText, clueNumber) => {
								return (
									<li
										key={clueNumber}
										value={clueNumber}
										className={classnames(
											"c_crossword-clues--down-list--clue clue-item",
											{
												"is-highlighted": props.selectedClueNumber &&
													props.currentDirection === "down" &&
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
	puzzle: PropTypes.instanceOf(ImmutablePuzzle).isRequired,
	selectedClueNumber: PropTypes.number,
	currentDirection: PropTypes.oneOf([
		"across",
		"down",
	]),
};

export default CrosswordClues;
