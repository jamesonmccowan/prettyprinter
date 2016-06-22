describe("The \"create\" function", function() {
    it("Can create a parser", function() {
        var p = new GP.create([], []);
        expect(typeof p == "object").toBe(true);
    });
    it("Can create a parser with symbols", function() {
        var symbols = [
            {
                "id": "string",
                "exp": [
                    /^'(([^\']((\.)?))*)'/,
                    /^"(([^\"]((\.)?))*)"/
                ]
            },
            {
                "id": "whitespace",
                "exp": /^\s+/
            },
        ];
        var p = new GP.create(symbols, []);
        expect(typeof p == "object").toBe(true);
        for (var i=0;i<symbols.length;i++) {
            expect(p.symbol_list[i])
                .toEqual(new GP.Symbol(symbols[i].id, symbols[i].exp));
            expect(p.symbol_list[i])
                .toEqual(p.symbol_table[p.symbol_list[i].id]);
        }
    });
    it("Can create a parser with duplicate symbols", function() {
        var s = [
            {"id": "string", "exp": /^'(([^\']((\.)?))*)'/},
            {"id": "string", "exp": /^"(([^\"]((\.)?))*)"/},
        ];
        var gp = new GP.create(s, []);
        var sym = gp.symbol_table.string;
        expect(sym.exp).toEqual([
            s[0].exp,
            s[1].exp,
        ]);
    });
    it("Can create a parser with phrases", function() {
        var phrases = [];
        phrases.push(new GP.Phrase("test1", [["get_symbols", "blah"]]));
        phrases.push(new GP.Phrase("test2", [["get_phrases", "test1"]]));
        var gp = new GP.create([], phrases);
        expect(typeof gp == "object").toBe(true);
        for (var i=0;i<phrases.length;i++) {
            expect(gp.phrase_table[phrases[i].id])
                .toEqual(phrases[i]);
        }
    });
    it("Can create a parser with symbols and phrases", function() {
        var symbols = [
            {
                "id": "string",
                "exp": [
                    /^'(([^\']((\.)?))*)'/,
                    /^"(([^\"]((\.)?))*)"/
                ]
            },
            {
                "id": "whitespace",
                "exp": /^\s+/
            },
        ];
        var phrases = [];
        phrases.push(new GP.Phrase("test1", [["get_symbols", "blah"]]));
        phrases.push(new GP.Phrase("test2", [["get_phrases", "test1"]]));
        var gp = new GP.create(symbols, phrases);
        expect(typeof gp == "object").toBe(true);
        for (var i=0;i<phrases.length;i++) {
            expect(gp.symbol_list[i])
                .toEqual(new GP.Symbol(symbols[i].id, symbols[i].exp));
            expect(gp.symbol_list[i])
                .toEqual(gp.symbol_table[gp.symbol_list[i].id]);
            expect(gp.phrase_table[phrases[i].id])
                .toEqual(phrases[i]);
        }
    });
    it("Errors if the \"symbol_list\" isn't an array", function() {
        var syms = [null, 1, true, {}];
        var errs = [
            {"object":null,"message":"Symbol list argument needs to be an array!","status":{"symbol_list":null}},
            {"object":null,"message":"Symbol list argument needs to be an array!","status":{"symbol_list":1}},
            {"object":null,"message":"Symbol list argument needs to be an array!","status":{"symbol_list":true}},
            {"object":null,"message":"Symbol list argument needs to be an array!","status":{"symbol_list":{}}}
        ]
        for (var i=0;i<syms.length;i++) {
            var error;
            try {
                new GP.create(syms[i]);
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual(errs[i]);
        }
    });
    it("Errors if the \"phrase_list\" isn't an array", function() {
        var phrs = [null, 1, true, {}];
        var errs = [
            {"object":null,"message":"Parser node definitions needs to be an array!","status":{"phrase_list":null}},
            {"object":null,"message":"Parser node definitions needs to be an array!","status":{"phrase_list":1}},
            {"object":null,"message":"Parser node definitions needs to be an array!","status":{"phrase_list":true}},
            {"object":null,"message":"Parser node definitions needs to be an array!","status":{"phrase_list":{}}}
        ]
        for (var i=0;i<phrs.length;i++) {
            var error;
            try {
                new GP.create([], phrs[i]);
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual(errs[i]);
        }
    });
});
