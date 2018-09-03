/* Install shims necessary for running tests */

// React 16+ shows error messages if requestAnimationFrame is not defined
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
