"use strict";

const _      = require('lodash');
const jQuery = require('jquery');

jQuery.noConflict();

function Dolla() {
	return jQuery(...arguments);
}

_.forOwn(
	jQuery,
	function(val, key) {
		Dolla[key] = val;
	}
);

_.forOwn(
	jQuery.prototype,
	function(val, key) {
		Dolla.prototype[key] = val;
	}
);

_.each(
	[
		'html',
		'append',
		'prepend',
		'prependTo',
		'appendTo',
		'wrap',
		'unwrap',
		'text',
		'remove',
	],
	function(funcName) {
		let oldFunc = Dolla.fn[funcName];
		Dolla.fn[funcName] = function() {
			oldFunc(...arguments);

			let $containingNodes;

			// These functions have the insertion target as the argument
			if (
				_.includes(
					[
						'prependTo',
						'appendTo',
						'wrap',
						'unwrap',
					],
					funcName
				)
			) {
				$containingNodes = Dolla(arguments[0]);
			}

			// Don't trigger if calling html() with no arguments (retrieval)
			if (
				funcName !== 'html' ||
				(
					!_.isUndefined(arguments[0])
				)
			) {
				this.trigger('dom-changed', {
					operation: funcName,
				});
			}
		};
	}
);

exports = module.exports = Dolla;
