"use strict";

var $                                    = require('jquery');
var _                                    = require('lodash');
var Backbone                             = require('backbone');
var dictionaryTermItemTemplate           = require('../../templates/partials/dictionary/term-item.hbs');
var dictionaryTermItemDefinitionTemplate = require('../../templates/partials/dictionary/term-item-definition.hbs');

exports = module.exports = Backbone.View.extend({
	events: {
		'submit .dictionary-search-form': '_handleSubmitSearchForm',
		'submit .search-results-form': '_handleSubmitResultsForm',
		'click .add-definition-button': '_handleClickAddDefinitionButton'
	},

	initialize: function() {
		var view = this;

		Backbone.View.prototype.initialize.apply(view, arguments);

		view._$searchResultsList = view.$('.search-results-list');

		view._$patternInput = view.$('[name="pattern"]');
	},

	_handleSubmitSearchForm: function(event) {
		var view = this;

		event.preventDefault();

		var $form = $(event.currentTarget);

		var pattern = view._$patternInput.val().toUpperCase();

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
	},

	_handleSubmitResultsForm: function(event) {
		var view = this;

		event.preventDefault();

		var $termItems = $(event.target).find('.dictionary-term-item');

		var $changedInputs = $();

		var termData = _.reduce(
			$termItems,
			function(data, item) {
				var $item = $(item);

				var $definitions = $item.find('[name="definition"]');

				var term = $item.find('[name="term"]').val();

				var definitions = [];

				var hasChangedDefinition = false;

				$definitions.each(
					function() {
						var $definition = $(this);

						var definition = $definition.val();

						var original = $definition.data('original');

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
					var $input = $(this);

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
	},

	_handleClickAddDefinitionButton: function(event) {
		var view = this;

		var $definitionList = $(event.target).closest('.dictionary-term-item')
			.find('.definitions');

		$definitionList.append(
			dictionaryTermItemDefinitionTemplate({
				definition: ''
			})
		);

		$definitionList.find('[name="definition"]').last().focus();
	}
});
