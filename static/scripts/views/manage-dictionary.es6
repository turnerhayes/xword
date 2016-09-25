"use strict";

/**
 * Manages the term dictionary
 *
 * @module views/manage-dictionary
 */

/**
 * Backbone view class
 *
 * @external Backbone/View
 * @see {@link http://backbonejs.org/#View|View}
 */

import $                                    from "jquery";
import _                                    from "lodash";
import Backbone                             from "backbone";
import dictionaryTermItemTemplate           from "../../templates/partials/dictionary/term-item.hbs";
import dictionaryTermItemDefinitionTemplate from "../../templates/partials/dictionary/term-item-definition.hbs";

const _events = {
	'submit .dictionary-search-form': '_handleSubmitSearchForm',
	'submit .search-results-form': '_handleSubmitResultsForm',
	'click .add-definition-button': '_handleClickAddDefinitionButton',
};

/**
 * View for managing the term dictionary
 *
 * @extends external:Backbone/View
 */
class ManageDictionaryView extends Backbone.View {
	/**
	 * Events object
	 *
	 * @type object
	 */
	get events() {
		return _events;
	}

	/**
	 * Initializes the view.
	 *
	 * @override
	 */
	initialize() {
		const view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);

		view._$searchResultsList = view.$('.search-results-list');

		view._$patternInput = view.$('[name="pattern"]');
	}

	/**
	 * Handles the `submit` event of the search form.
	 *
	 * @private
	 *
	 * @param {event} event - the submit event
	 */
	_handleSubmitSearchForm(event) {
		const view = this;

		event.preventDefault();

		const $form = $(event.currentTarget);

		const pattern = view._$patternInput.val().toUpperCase();

		$.get({
			url: '/dictionary/termList',
			data: {
				pattern: pattern
			}
		}).done(
			function(data) {
				view._$searchResultsList.html(
					_.map(
						data.results,
						function(result) {
							return dictionaryTermItemTemplate(result);
						}
					).join('')
				);
			}
		);
	}

	/**
	 * Handles the `submit` event of the result change form.
	 *
	 * @private
	 *
	 * @param {event} event - the submit event
	 */
	_handleSubmitResultsForm(event) {
		const view = this;

		event.preventDefault();

		const $termItems = $(event.target).find('.dictionary-term-item');

		let $changedInputs = $();

		const termData = _.reduce(
			$termItems,
			function(data, item) {
				const $item = $(item);

				const $definitions = $item.find('[name="definition"]');

				const term = $item.find('[name="term"]').val();

				const definitions = [];

				let hasChangedDefinition = false;

				$definitions.each(
					function() {
						const $definition = $(this);

						const definition = $definition.val();

						const original = $definition.data('original');

						if (definition !== original) {
							hasChangedDefinition = true;
							$changedInputs = $changedInputs.add($definition);
						}

						if (definition) {
							// ignore empty definitions
							definitions.push(definition);
						}
					}
				);
			
				if (hasChangedDefinition) {
					data[term] = definitions;
				}

				return data;
			},
			{}
		);

		if (_.isEmpty(termData)) {
			console.log('No changes to save');
			return;
		}

		$.ajax({
			url: '/dictionary/termList',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(termData)
		}).done(
			function(results) {
				$changedInputs.each(function() {
					const $input = $(this);

					if ($input.val().replace(/s/g, '').length === 0) {
						$input.remove();
					}
					else {
						$input.data('original', $input.val());

						$input.off('animationend.manage-dictionary-updated')
							.one('animationend.manage-dictionary-updated', function() {
								$input.removeClass('updated');
							});

						$input.addClass('updated');
					}

				});
			}
		);
	}

	/**
	 * Handles the `click` event of the button to add a term definition.
	 *
	 * @private
	 *
	 * @param {event} event - the click event
	 */
	_handleClickAddDefinitionButton(event) {
		const view = this;

		const $definitionList = $(event.target).closest('.dictionary-term-item')
			.find('.definitions');

		$definitionList.append(
			dictionaryTermItemDefinitionTemplate({
				definition: ''
			})
		);

		$definitionList.find('[name="definition"]').last().focus();
	}
}

export default ManageDictionaryView;
