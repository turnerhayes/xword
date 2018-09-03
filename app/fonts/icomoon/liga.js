/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    
    function supportsProperty(p) {
        let prefixes = ["Webkit", "Moz", "O", "ms"],
            i,
            div = document.createElement("div"),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    let icons;
    if (!supportsProperty("fontFeatureSettings")) {
        icons = {
            search: "&#xf002;",
            find: "&#xf002;",
            user: "&#xf007;",
            profile: "&#xf007;",
            "zoom in": "&#xf00e;",
            "zoom out": "&#xf010;",
            settings: "&#xf013;",
            font: "&#xf031;",
            right: "&#xf061;",
            across: "&#xf061;",
            down: "&#xf063;",
            twitter: "&#xf081;",
            facebook: "&#xf082;",
            "log out": "&#xf08b;",
            upload: "&#xf093;",
            "empty square": "&#xf096;",
            "input square": "&#xf096;",
            "filled square": "&#xf0c8;",
            "block square": "&#xf0c8;",
            "google plus": "&#xf0d4;",
            loading: "&#xf110;",
            erase: "&#xe900;",
            "clear puzzle": "&#xe900;",
          0: 0
        };
        delete icons["0"];
        window.icomoonLiga = function (els) {
            let classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName("*");
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/icon/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, "g"), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());
