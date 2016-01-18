import $       from "jquery";
import _       from "lodash";
import viewMap from "./view-map";

class ViewStarter {
	static run($baseEl) {
		var $viewElements;

		if (!$baseEl || $baseEl.length === 0) {
			return;
		}

		$viewElements = $baseEl.find('[data-view-classes]').addBack('[data-view-classes]');

		if ($viewElements.length === 0) {
			return;
		}

		$viewElements.each(
			function() {
				var el = this;
				var viewClasses = $(el).data('view-classes').split(/\s/);

				if (viewClasses.length === 0) {
					return;
				}

				_.each(
					viewClasses,
					function(viewClass) {
						var View = viewMap[viewClass];

						new View({
							el: el,
						}).render();
					}
				);
			}
		);
	}
}

export default ViewStarter;
