function xmlmatch_test_main () {
    with (xmlmatch) {
        var elem = E_ ("root", {},
                       E_ ("c1", {}, "cont c1"),
                       E_ ("c2", {}, "cont c2"),
                       E_ ("c3", {},
                           E_ ("c31", {}, "cont c31"),
                           E_ ("c32", {}, "cont c32"))) (document);

        console.debug (elem);

        var eat_c1 = M ("c1", function (c) {console.debug (c.textContent == "cont c1" && "GOOD!");});
        var eat_c2 = M ("c2");
        var eat_c31 = M ("c31");
        var eat_c32 = M ("c32");
        var eat_c3 = M ("c3", concat (eat_c31, eat_c32));
        var eat_root = M ("root", C (eat_c1, eat_c2, eat_c3));

        var ret = eat_root (elem);

        console.debug ("done", ret);
    }
}

xmlmatch = {};

xmlmatch.alter = function () {
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
};

xmlmatch.concat = function () {
    var seq = arguments;

    return function (elem) {
        for (var c = elem.firstChild, i = 0; i < seq.length; c = c.nextSibling, i ++) {
            if (! seq[i] (c))
                return false;
        }
        return true;
    };
};

xmlmatch.star = function (p) {
    return function (elem) {
        for (var c = elem.firstChild; c; c = c.nextSibling) {
            p (c);
        }

        return true;
    }
};

xmlmatch.children = function () {
    return xmlmatch.star (xmlmatch.alter.apply (this, arguments));
};

xmlmatch.matcher = function (tagname) {
    var procs = arguments;
    return function (e) {
        if (e.tagName.toLowerCase () != tagname) {
            // console.debug (e.tagName.toLowerCase (), "!=", tagname);

            return false;
        }

        console.debug ("eating " + tagname);

        for (var i = 1; i < procs.length; i ++) {
            var p = procs[i];
            if (p) {
                var ret = p (e);
                if (! ret)
                    return false;
            }
        }

        return true;
    }
};

xmlmatch.M = xmlmatch.matcher;
xmlmatch.C = xmlmatch.children;
