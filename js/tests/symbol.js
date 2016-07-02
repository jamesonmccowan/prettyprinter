describe("The \"Symbol\" function", function() {
    it("Can create a symbol", function() {
        var s1 = new GP.Symbol("test1", "test1");
        var s2 = new GP.Symbol("test2", /test2/);
        var s3 = new GP.Symbol("test3", ["test3", /test4/]);
        expect(typeof s1 == "object").toBe(true);
        expect(typeof s2 == "object").toBe(true);
        expect(typeof s3 == "object").toBe(true);
        expect(s1.id).toEqual("test1");
        expect(s2.id).toEqual("test2");
        expect(s3.id).toEqual("test3");
        expect(s1.exp).toEqual([new RegExp("test1")]);

        var s = new GP.Symbol("test2", [new RegExp("test"), "test"]);
        expect(s.id).toEqual("test2");
        expect(s.exp).toEqual([new RegExp("test"), new RegExp("test")]);
    });
    it("Can create a symbol from an object", function() {
        var s1 = new GP.Symbol({"id": "test1", "exp": "test1"});
        var s2 = new GP.Symbol({"id": "test2", "exp": /test2/});
        var s3 = new GP.Symbol({"id": "test3", "exp": ["test3", /test4/]});
        expect(typeof s1 == "object").toBe(true);
        expect(typeof s2 == "object").toBe(true);
        expect(typeof s3 == "object").toBe(true);
        expect(s1.id).toEqual("test1");
        expect(s2.id).toEqual("test2");
        expect(s3.id).toEqual("test3");
        expect(s1.exp).toEqual([new RegExp("test1")]);

        var s = new GP.Symbol("test2", [new RegExp("test"), "test"]);
        expect(s.id).toEqual("test2");
        expect(s.exp).toEqual([new RegExp("test"), new RegExp("test")]);
    });
    it("Created symbols can detect matching strings", function() {
        var id = random_string();
        var s = new GP.Symbol(id, "^" + id + "$");

        expect(s.match(id)).toEqual({"id": id, "length": id.length, "text": id});
        expect(s.match(" " + id + " ")).toBe(false);
    });
    it("Can handle two string definitions", function () {
        var s = [
            {"id": "string", "exp": /^'(([^\']((\.)?))*)'/, "match": "'match'"},
            {"id": "string", "exp": /^"(([^\"]((\.)?))*)"/, "match": '"match"'},
        ];
        for (var i=0;i<s.length;i++) {
            var symbol = new GP.Symbol(s[i].id, s[i].exp);
            expect(symbol.id).toEqual(s[i].id);
            expect(symbol.exp).toEqual([s[i].exp]);
            expect(symbol.match(s[i].match)).toEqual({"id": s[i].id, "length": s[i].match.length, "text": s[i].match});
            expect(symbol.match("blah")).toEqual(false);
        }
    });
    it("Errors if no \"id\" variable provided", function () {
        var error;
        try {
            new GP.Symbol();
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {},
            "message": "Symbol needs to have an \"id\" of type string!",
            "status": {}
        });
        try {
            new GP.Symbol({});
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {},
            "message": "Symbol needs to have an \"id\" of type string!",
            "status": {}
        });
    });
    it("Errors if invalid \"id\" variable provided", function () {
        var ids = ["", true, {}, []];
        for (var i=0;i<ids.length;i++) {
            var error;
            try {
                new GP.Symbol(ids[i]);
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual({
                "object": {},
                "message": "Symbol needs to have an \"id\" of type string!",
                "status": {}
            });
        }
    });
    it("Errors if no \"exp\" variable", function() {
        var id = random_string();
        var error = "???";
        try {
            new GP.Symbol("test");
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {id: 'test', exp: [ ]},
            "message": "Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!",
            "status": {}
        });
        try {
            new GP.Symbol({"id": "test"});
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {id: 'test', exp: [ ]},
            "message": "Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!",
            "status": {}
        });
    });
    it("Errors if invalid \"exp\" variable provided", function () {
        var exps = ["", true, null, {}, []];
        for (var i=0;i<exps.length;i++) {
            var error;
            try {
                new GP.Symbol("test", exps[i]);
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual({
                "object": {id: 'test', exp: [ ]},
                "message": "Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!",
                "status": {}
            });
            try {
                new GP.Symbol({"id": "test", "exp": exps[i]});
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual({
                "object": {id: 'test', exp: [ ]},
                "message": "Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!",
                "status": {}
            });
        }
    });
});
