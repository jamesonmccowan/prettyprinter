describe("A Parser object Errors", function() {
    it("If \"add_symbo\" is given something other then a symbol to add", function() {
        var gp = new GP.create([], []);
        expect(typeof gp == "object").toBe(true);
        expect(gp.symbol_list).toEqual([]);
        expect(gp.symbol_table).toEqual({});

        var error;
        try {
            gp.add_symbol(5);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object":{"id":"5","exp":[]},
            "message":"Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!",
            "status":{}
        });
    });
    it("If \"add_phrase\" is given something other then a phrase to add", function() {
        var gp = new GP.create([], []);
        expect(typeof gp == "object").toBe(true);
        expect(gp.phrase_table).toEqual({});

        var error;
        try {
            gp.add_phrase(5);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": { id: '5' },
            "message": 'Test Parse Error: Expected Array',
            "status": {}
        });
    });
    it("If no match is found", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
        ];
        var gp = new GP.create(s, []);
        var str = '"A string"';
        var error;
        try {
            gp.lex(str);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": null,
            "message": 'Lex Error: no matching symbol found for ""A st"',
            "status": {
                "matched_symbols": [ ],
                "string": '"A string"',
                "symbol_list": [
                    { "id": 'string', exp: [ { } ] }
                ]
            }
        });
    });
    it("If given something other then a string or array to parse", function() {
        var parse = [1, true, {}, null];
        var gp = new GP.create([], []);
        var error;
        for (var i=0;i<parse.length;i++) {
            try {
                gp.parse(parse[i]);
            } catch (e) {
                error = JSON.parse(JSON.stringify(e));
            }
            expect(error).toEqual({
                "object": null,
                "message": 'Parse Error: Expected Array or String, got type "' + (typeof parse[i]) + '"',
                "status": { "str": parse[i] }
            });
        }
    });
    it("If it trys to parse with no phrase called 'program'", function() {
        var gp = new GP.create([], []);
        var error;
        try {
            gp.parse("");
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": null,
            "message": 'Parse Error: Phrase "Program" not found. A "Program" Phrase is needed for the parser to start parsing',
            "status": { "phrase_table": { } }
        });
    });
    it("If \"get_symbols\" finds no matching symbol", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "boolean", "exp": ["true", "false"]},
        ];
        var p = [
            { "id": "program", "parse": [[ "get_symbols",  "boolean" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var error;
        try {
            gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program',
                "parse": [
                    [ 'get_symbols', 'boolean' ]
                ]
            },
            "message": 'Parse Error: expected symbol "boolean", and got "string" instead',
            "status": {
                "action": [ 'get_symbols', 'boolean' ],
                "symbol": {
                    "id": 'string',
                    "length": 10,
                    "text": '"A string"'
                },
                "index": 0
            }
        });

        p = [
            { "id": "program", "parse": [[ "get_symbols",  "unknown symbol" ]], }
        ];
        gp = new GP.create(s, p);
        var str = '"A string"';
        var error;
        try {
            gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program',
                "parse": [
                    [ 'get_symbols', 'unknown symbol' ]
                ]
            },
            "message": 'Parse Error: expected symbol "unknown symbol", and got "string" instead',
            "status": {
                "action": [ 'get_symbols', 'unknown symbol' ],
                "symbol": {
                    "id": 'string',
                    "length": 10,
                    "text": '"A string"'
                },
                "index": 0
            }
        });
    });
    it("If \"get_phrases\"finds no matching phrase", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var p = [
            { "id": "program", "parse": [[ "get_phrases",  "string_" ]], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var error;
        try {
            gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program',
                "parse": [
                    [ 'get_phrases', 'string_' ]
                ]
            },
            "message": 'Parse Error: expected phrase "string_"',
            "status": {
                "action": [ 'get_phrases', 'string_' ],
                "symbol": { "id": 'string', "length": 10, "text": '"A string"' },
                "index": 0
            }
        });

        p = [
            { "id": "program", "parse": [[ "get_phrases",  [ "get_symbols",  "string" ] ]], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], }
        ];
        gp = new GP.create(s, p);
        str = '"A string"';
        try {
            gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program',
                "parse": [
                    [ 'get_phrases', [ 'get_symbols', 'string' ] ]
                ]
            },
            "message": 'Parse Error: bad phrase request',
            "status": {
                "action": [ 'get_phrases', [ 'get_symbols', 'string' ] ],
                "symbol": {
                    "id": 'string',
                    "length": 10,
                    "text": '"A string"'
                },
                "index": 0
            }
        });

    });
    it("If \"and\" doesn't find matches for all its elements", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [[
                "and",
                [ "get_phrases",  "string" ],
                [ "get_symbols",  "camma" ],
                [ "get_phrases",  "string" ],
                [ "get_symbols",  "camma" ],
                [ "get_phrases",  "string" ],
            ]], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"string 1",\'string 2\',';
        var error;
        try {
            var ast = gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program',
                "parse": [
                    [ 'and',
                        [ 'get_phrases', 'string' ],
                        [ 'get_symbols', 'camma' ],
                        [ 'get_phrases', 'string' ],
                        [ 'get_symbols', 'camma' ],
                        [ 'get_phrases', 'string' ]
                    ]
                ]
            },
            "message": 'Parse Error: "And" didn\'t find a match for every element',
            "status": {
                "action": [ 'and',
                    [ 'get_phrases', 'string' ],
                    [ 'get_symbols', 'camma' ],
                    [ 'get_phrases', 'string' ],
                    [ 'get_symbols', 'camma' ],
                    [ 'get_phrases', 'string' ]
                ],
                "index": 4,
                "unmatched": [ [ 'get_phrases', 'string' ] ]
            }
        });
    });
    it("If \"or\" finds no matches", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "number", "exp": /^(-?)(\d+)((\.\d+)?)/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [
                [ "or",
                    [ "get_phrases",  "string" ],
                    [ "get_phrases",  "number" ],
                ],
                [ "get_symbols",  "camma" ],
                [ "or",
                    [ "get_phrases",  "string" ],
                ],
            ], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], },
            { "id": "number", "parse": [[ "get_symbols",  "number" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string!",-123.5';
        var error;
        try {
            var ast = gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": "program",
                "parse": [
                    [ "or",
                        [ "get_phrases",  "string" ],
                        [ "get_phrases",  "number" ],
                    ],
                    [ "get_symbols",  "camma" ],
                    [ "or",
                        [ "get_phrases",  "string" ],
                    ],
                ],
            },
            "message": "Parse Error: \"Or\" didn't find a match for any element",
            "status": {
                "action": [ "or", ["get_phrases","string"] ],
                "symbol": { "id": "number", "length": 6, "text": "-123.5" },
                "index": 2
            }
        });
    });
    it("If \"xor\" finds no matches", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "number", "exp": /^(-?)(\d+)((\.\d+)?)/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [
                [ "xor",
                    [ "get_phrases",  "string" ],
                    [ "get_phrases",  "number" ],
                ],
                [ "get_symbols",  "camma" ],
                [ "xor",
                    [ "get_phrases",  "string" ],
                ],
            ], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], },
            { "id": "number", "parse": [[ "get_symbols",  "number" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string!",-123.5';
        var error;
        try {
            var ast = gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": "program",
                "parse": [
                    [ "xor",
                        [ "get_phrases",  "string" ],
                        [ "get_phrases",  "number" ],
                    ],
                    [ "get_symbols",  "camma" ],
                    [ "xor",
                        [ "get_phrases",  "string" ],
                    ],
                ],
            },
            "message": "Parse Error: \"Xor\" didn't find a match for any element",
            "status": {
                "action": [ "xor", ["get_phrases","string"] ],
                "symbol": { "id": "number", "length": 6, "text": "-123.5" },
                "index": 2
            }
        });
    });
    it("If \"one_or_more\" zero matches found", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [[ "one_or_more",
                [ "get_symbols", "camma" ]
            ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var error;
        try {
            var ast = gp.parse(str, false);
        } catch (e) {
            error = JSON.parse(JSON.stringify(e));
        }
        expect(error).toEqual({
            "object": {
                "id": 'program', "parse": [[ 'one_or_more', [ 'get_symbols', 'camma' ] ]]
            },
            "message": "Parse Error: one_or_more didn't find any elements",
            "status": {
                "action": [ 'one_or_more', [ 'get_symbols', 'camma' ] ],
                "symbol": { "id": 'string', "length": 10, "text": '"A string"' },
                "index": 0
            }
        });
    });
});
