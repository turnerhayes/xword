

const readline = require("readline");

const ANIMATION_INTERVAL = 500;

const DEFAULT_NUMBER_OF_DOTS = 3;

/**
 * Adds an animated progress indicator
 *
 * @param  {string} message      The message to write next to the indicator
 * @param  {number} amountOfDots The amount of dots you want to animate
 */
function animateProgress(message, amountOfDots) {
	if (typeof amountOfDots !== "number") {
		amountOfDots = DEFAULT_NUMBER_OF_DOTS;
	}

	let i = 0;
	return setInterval(function() {
		readline.cursorTo(process.stdout, 0);
		i = (i + 1) % (amountOfDots + 1);
		const dots = new Array(i + 1).join(".");
		process.stdout.write(message + dots);
	}, ANIMATION_INTERVAL);
}

module.exports = animateProgress;
