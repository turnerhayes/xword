import $              from "jquery";

// Bootstrap relies on a window-level jQuery object, unfortunately, so
// we set it explicitly (if jQuery is imported as a module, it doesn't
// seem to get set on the window)
window.jQuery = $;

import initHandlebars from "./init/handlebars";
import ViewStarter    from './view-starter';

initHandlebars();

ViewStarter.run($(document.body));
