import $       from "jquery";
import _       from "lodash";
import _debug   from "debug";
import viewMap from "./view-map";

const debug = _debug('xword:client:view-starter');

class ViewStarter {
	static run($baseEl) {
		let $viewElements;

		if (!$baseEl || $baseEl.length === 0) {
			return;
		}

		$viewElements = $baseEl.find('[data-view-classes]').addBack('[data-view-classes]');

		if ($viewElements.length === 0) {
			return;
		}

		$viewElements.each(
			function() {
				let el = this;
				let viewClasses = $(el).data('view-classes').split(/\s/);

				if (viewClasses.length === 0) {
					return;
				}

				_.each(
					viewClasses,
					function(viewClass) {
						let View = viewMap[viewClass];

						new View({
							el: el,
						}).render();
					}
				);
			}
		);
	}
}

ViewStarter._VIEW_STARTER_OBSERVER = new window.MutationObserver(function(mutations) {
	_.each(
		mutations,
		function(mutation) {
			if (_.size(mutation.addedNodes) > 0) {
				_.each(
					mutation.addedNodes,
					function(node) {
						if (
							// Only run the view starter on elements
							node.nodeType !== Node.ELEMENT_NODE ||
							// The node does not have a view associated, and has no children
							// (therefore no children with views associated)
							(!node.dataset.viewClasses && node.children.length === 0)
						) {
							return;
						}

						debug('running view starter on node ', node);
						ViewStarter.run($(node));
					}
				);
			}
		}
	);
});

ViewStarter._VIEW_STARTER_OBSERVER.observe(
	document.body,
	{
		childList: true,
		subtree: true,
	}
);

export default ViewStarter;
