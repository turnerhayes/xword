import _          from "lodash";
import Handlebars from "hbsfy/runtime";
import getHelpers from "../../../hbs-helpers";
import partials   from "../partials";

export default function init() {
	Handlebars.registerHelper(getHelpers(Handlebars));

	_.each(
		partials,
		function(compiledPartial, partialName) {
			Handlebars.registerPartial(partialName, compiledPartial);
		}
	);
}
