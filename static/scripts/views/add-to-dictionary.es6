"use strict";

/**
 * Adds entries to the dictionary
 *
 * @module views/add-to-dictionary
 */

/**
 * Backbone view class
 *
 * @external Backbone/View
 * @see {@link http://backbonejs.org/#View|View}
 */

import $                                    from "jquery"
import _                                    from "lodash"
import Backbone                             from "backbone"
import dictionaryTermItemDefinitionTemplate from "../../templates/partials/dictionary/term-item-definition.hbs"

const _events = {
	'submit .add-to-dictionary-form': '_handleSubmitAddToDictionary',
	'click .add-definition-button': '_handleClickAddDefinitionButton'
};

/**
 * View for adding to the dictionary.
 *
 * @extends external:Backbone/View
 */
class AddToDictionaryView extends Backbone.View {
	/**
	 * Events object
	 *
	 * @type object
	 */
	get events() {
		return _events;
	}

	/**
	 * Handles a click of the button to add a definition for a term.
	 *
	 * @private
	 *
	 * @param {event} event - the click event
	 */
	_handleClickAddDefinitionButton(event) {
		const view = this;

		const $definitionList = $(event.target).closest('.term-definition-group')
			.find('.definitions');

		$definitionList.append(
			dictionaryTermItemDefinitionTemplate({
				definition: ''
			})
		);

		$definitionList.find('[name="definition"]').last().focus();
	}

	/**
	 * Handles a submit event of the add form.
	 *
	 * @private
	 *
	 * @param {event} event - the submit event
	 */
	_handleSubmitAddToDictionary(event) {
		const view = this;

		event.preventDefault();

		const $form = $(event.target);

		const term = $form.find('[name="term"]').val().toUpperCase();

		const definitions = _.map(
			$form.find('[name="definition"]'),
			(def) => $(def).val()
		);

		const data = {};

		data[term] = definitions;

		$.ajax({
			url: '/dictionary/term',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(data)
		}).done(
			function(results) {
				
			}
		);
	}
};

export default AddToDictionaryView;
