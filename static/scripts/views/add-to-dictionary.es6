"use strict";

var $                                    = require('jquery');
var _                                    = require('lodash');
var Backbone                             = require('backbone');
var dictionaryTermItemDefinitionTemplate = require('../../templates/partials/dictionary/term-item-definition.hbs');

exports = module.exports = Backbone.View.extend({
	events: {
		'submit .add-to-dictionary-form': '_handleSubmitAddToDictionary',
		'click .add-definition-button': '_handleClickAddDefinitionButton'
	},

	initialize: function() {
		var view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);
	},

	_handleClickAddDefinitionButton: function(event) {
		var view = this;

		var $definitionList = $(event.target).closest('.term-definition-group')
			.find('.definitions');

		$definitionList.append(
			dictionaryTermItemDefinitionTemplate({
				definition: ''
			})
		);

		$definitionList.find('[name="definition"]').last().focus();
	},

	_handleSubmitAddToDictionary: function(event) {
		var view = this;

		event.preventDefault();

		var $form = $(event.target);

		var term = $form.find('[name="term"]').val().toUpperCase();

		var definitions = _.map(
			$form.find('[name="definition"]'),
			function(def) {
				return $(def).val();
			}
		);

		var data = {};

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
});
