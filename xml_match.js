function xmlmatch_test_main () {
    with (xmlmatch) {
        var elem = E_ ("root", {},
                       E_ ("c1", {}, "cont c1"),
                       E_ ("c2", {}, "cont c2"),
                       E_ ("c3", {},
                           E_ ("c31", {}, "cont c31"),
                           E_ ("c32", {}, "cont c32"))) (document);

        console.debug (elem);

        var eat_c1 = eat_tag_func ("c1", function (c) {console.debug (c.textContent);});
        var eat_c2 = eat_tag_func ("c2");
        var eat_c31 = eat_tag_func ("c31");
        var eat_c32 = eat_tag_func ("c32");
        var eat_c3 = eat_tag_func ("c3", concatenate (eat_c31, eat_c32));
        var eat_root = eat_tag_func ("root", star (alternate (eat_c1, eat_c2, eat_c3)));

        var ret = eat_root (elem);

        console.debug ("done", ret);
    }
}

xmlmatch = {};

xmlmatch.alternate = function () {
    var options = arguments;

    return function (c) {
        for (var i = 0; i < options.length; i ++) {
            var p = options[i];
            if (p (c)) {
                return true;
            }
        }

        return false;
    };
}

xmlmatch.concatenate = function () {
    var seq = arguments;

    return function (elem) {
        for (var c = elem.firstChild, i = 0; i < seq.length; c = c.nextSibling, i ++) {
            if (! seq[i] (c))
                return false;
        }
        return true;
    };
}

xmlmatch.star = function (p) {
    return function (elem) {
        for (var c = elem.firstChild; c; c = c.nextSibling) {
            p (c);
        }

        return true;
    }
}

xmlmatch.eat_tag_func = function (tagname, p) {
    return function (e) {
        if (e.tagName.toLowerCase () != tagname) {
            return false;
        }

        console.debug ("eating " + tagname);

        return p ? p (e) : true;
    }
}
