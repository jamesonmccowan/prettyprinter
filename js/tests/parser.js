describe("A Parser object", function() {
    it("Can add and remove symbols", function() {
        var gp = new GP.create([], []);
        expect(typeof gp == "object").toBe(true);
        expect(gp.symbol_list).toEqual([]);
        expect(gp.symbol_table).toEqual({});

        var s = new GP.Symbol("test1", "test");
        gp.add_symbol(s);
        expect(gp.symbol_list).toEqual([s]);
        expect(gp.symbol_table).toEqual({"test1":s});
        gp.remove_symbol(s.id);
        expect(gp.symbol_list).toEqual([]);
        expect(gp.symbol_table).toEqual({});
        gp.remove_symbol(s.id);
        expect(gp.symbol_list).toEqual([]);
        expect(gp.symbol_table).toEqual({});
    });
    it("Can add and remove phrases", function() {
        var gp = new GP.create([], []);
        expect(typeof gp == "object").toBe(true);
        expect(gp.phrase_table).toEqual({});

        var p = new GP.Phrase("test1", [["get_symbols", "test1"]]);
        gp.add_phrase(p);
        expect(gp.phrase_table).toEqual({"test1":p});
        gp.remove_phrase(p.id);
        expect(gp.phrase_table).toEqual({});
        gp.remove_phrase(p.id);
        expect(gp.phrase_table).toEqual({});
    });
    it("Can lex an empty string", function() {
        var gp = new GP.create([], []);
        expect(typeof gp == "object").toBe(true);
        expect(function () {
            var l = gp.lex("");
            expect(l).toEqual([]);
        }).not.toThrow();
    });
    it("Can lex a string of a string", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var gp = new GP.create(s, []);
        var str = '"A string"';
        var l = gp.lex(str);
        expect(l).toEqual([{
            "id": "string",
            "length": str.length,
            "text": str,
        }]);
    });
    it("Can lex a string of JSON", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "left brace", "exp": /^{/},
            {"id": "right brace", "exp": /^}/},
            {"id": "left bracket", "exp": /^\[/},
            {"id": "right bracket", "exp": /^]/},
            {"id": "number", "exp": /^(-?)(\d+)((\.\d+)?)/},
            {"id": "bool", "exp": /^([Tt]rue|[Ff]alse)/},
            {"id": "null", "exp": /^null/},
            {"id": "whitespace", "exp": /^\s+/},
            {"id": "camma", "exp": /^,/},
            {"id": "colon", "exp": /^:/},
        ];
        var gp = new GP.create(s, []);
        var str = JSON.stringify({
            number: -12345.06789,
            "string": "\"'\'confuse the parser\\\"",
            "booleans": [true, false],
            empty: null,
        });
        var l = gp.lex(str);
        var sm = [
            { id: 'left brace',    length: 1,  text: '{' },
            { id: 'string',        length: 8,  text: '"number"' },
            { id: 'colon',         length: 1,  text: ':' },
            { id: 'number',        length: 12, text: '-12345.06789' },
            { id: 'camma',         length: 1,  text: ',' },
            { id: 'string',        length: 8,  text: '"string"' },
            { id: 'colon',         length: 1,  text: ':' },
            { id: 'string',        length: 28, text: '"\\"\'\'confuse the parser\\\\\\""' },
            { id: 'camma',         length: 1,  text: ',' },
            { id: 'string',        length: 10, text: '"booleans"' },
            { id: 'colon',         length: 1,  text: ':' },
            { id: 'left bracket',  length: 1,  text: '[' },
            { id: 'bool',          length: 4,  text: 'true' },
            { id: 'camma',         length: 1,  text: ',' },
            { id: 'bool',          length: 5,  text: 'false' },
            { id: 'right bracket', length: 1,  text: ']' },
            { id: 'camma',         length: 1,  text: ',' },
            { id: 'string',        length: 7,  text: '"empty"' },
            { id: 'colon',         length: 1,  text: ':' },
            { id: 'null',          length: 4,  text: 'null' },
            { id: 'right brace',   length: 1,  text: '}' }
        ];
        for (var i=0;i<l.length;i++) {
            expect(l[i]).toEqual(sm[i]);
        }
    });
    it("Can parse an empty string", function() {
        var s = [
            {"id": "anything", "exp": /^.*/}
        ];
        var p = [
            { "id": "program", "parse": [[ "get_symbols",  "anything" ]], }
        ];
        var gp = new GP.create(s, p);
        var ast = gp.parse("", false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual({"type":"program","index":0,"nodes":[],"size":0});
    });
    it("Can parse a string of a string", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var p = [
            { "id": "program", "parse": [[ "get_symbols",  "string" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual({
            "type": "program", "index": 0, "size": 1, "nodes": [{
                "type": "ast", "id": "program", "index": 0, "size": 1, "nodes": [{
                    "type": "symbols", "index": 0, "size": 1, "nodes": [{
                        "id":"string","length":10,"text":"\"A string\""
                    }],
                }],
            }],
        });
    });
    it("Can parse using \"get_symbols\"", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var p = [
            { "id": "program", "parse": [[ "get_symbols",  "string" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual({
            "type": "program", "index": 0, "size": 1, "nodes": [{
                "type": "ast", "id": "program", "index": 0, "size": 1, "nodes": [{
                    "type": "symbols", "index": 0, "size": 1, "nodes": [{
                        "id": "string", "length": 10, "text": "\"A string\""
                    }],
                }],
            }]
        });
    });
    it("Can parse using \"get_phrases\"", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var p = [
            { "id": "program", "parse": [[ "get_phrases",  "string" ]], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual({
            "type": "program", "index": 0, "size": 1, "nodes": [{
                "type": "ast", "id": "program", "index": 0, "size": 1, "nodes": [{
                    "type": "phrases", "index": 0, "size": 1, "nodes": [{
                        "type":"ast", "id": "string", "index": 0, "size": 1, "nodes": [{
                            "type": "symbols", "index": 0, "size": 1, "nodes": [{
                                "id": "string", "length": 10, "text": "\"A string\""
                            }],
                        }],
                    }],
                }],
            }],
        });
    });
    it("Can parse using \"and\"", function() {
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
        var str = '"string 1",\'string 2\',"string 3"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 5, "nodes": [
                { "type": "ast", "id": "program", "index": 0, "size": 5, "nodes": [
                    {"type": "and", "index": 0, "size": 5, "nodes": [
                        {"type": "phrases", "index": 0, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 0, "size": 1, "nodes": [
                                {"type": "symbols", "index": 0, "size": 1, "nodes": [
                                    {"id": "string", "length": 10, "text": "\"string 1\""}
                                ]}
                            ]}
                        ]},
                        {"type": "symbols", "index": 1, "size": 1, "nodes": [
                            {"id": "camma", "length": 1, "text": ","}
                        ]},
                        {"type": "phrases", "index": 2, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 2, "size": 1, "nodes": [
                                {"type": "symbols", "index": 2, "size": 1, "nodes": [
                                    {"id": "string", "length": 10, "text": "'string 2'"}
                                ]}
                            ]}
                        ]},
                        {"type": "symbols", "index": 3, "size": 1, "nodes": [
                            {"id": "camma", "length": 1, "text": ","}
                        ]},
                        {"type": "phrases", "index": 4, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 4, "size": 1, "nodes": [
                                {"type": "symbols", "index": 4, "size": 1, "nodes": [
                                    {"id":"string","length":10,"text":"\"string 3\""}
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        );
    });
    it("Can parse using \"or\"", function() {
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
                    [ "get_phrases",  "number" ],
                ],
            ], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], },
            { "id": "number", "parse": [[ "get_symbols",  "number" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string!",-123.5';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 3, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 3, "nodes": [
                    {"type": "or", "index": 0, "size": 1, "nodes": [
                        {"type": "phrases", "index": 0, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 0, "size": 1, "nodes": [
                                {"type": "symbols", "index": 0, "size": 1, "nodes": [
                                    {"id": "string", "length": 11, "text": "\"A string!\""}
                                ]}
                            ]}
                        ]}
                    ]},
                    {"type": "symbols", "index": 1, "size": 1, "nodes": [
                        {"id": "camma", "length": 1, "text": ","}
                    ]},
                    {"type": "or", "index": 2, "size": 1, "nodes": [
                        {"type": "phrases", "index": 2, "size": 1, "nodes": [
                            {"type": "ast", "id": "number", "index": 2, "size": 1, "nodes": [
                                {"type": "symbols", "index": 2, "size": 1, "nodes": [
                                    {"id":"number","length":6,"text":"-123.5"}
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        );
        str = '"A string!",-123.5"number"';
        ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 4, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 4, "nodes": [
                    {"type": "or", "index": 0, "size": 1, "nodes": [
                        {"type": "phrases", "index": 0, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 0, "size": 1, "nodes": [
                                {"type": "symbols", "index": 0, "size": 1, "nodes": [
                                    {"id": "string", "length": 11, "text": "\"A string!\""}
                                ]}
                            ]}
                        ]}
                    ]},
                    {"type": "symbols", "index": 1, "size": 1, "nodes": [
                        {"id": "camma", "length": 1, "text": ","}
                    ]},
                    {"type": "or", "index": 2, "size": 2, "nodes": [
                        {"type": "phrases", "index": 2, "size": 1, "nodes": [
                            {"type": "ast", "id": "number", "index": 2, "size": 1, "nodes": [
                                {"type": "symbols", "index": 2, "size": 1, "nodes": [
                                    {"id":"number","length":6,"text":"-123.5"}
                                ]}
                            ]}
                        ]},
                        {"type": "phrases", "index": 3, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 3, "size": 1, "nodes": [
                                {"type": "symbols", "index": 3, "size": 1, "nodes": [
                                    {"id": "string", "length": 8, "text": "\"number\""}
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        );
    });
    it("Can parse using \"xor\"", function() {
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
                    [ "get_phrases",  "number" ],
                ],
            ], },
            { "id": "string", "parse": [[ "get_symbols",  "string" ]], },
            { "id": "number", "parse": [[ "get_symbols",  "number" ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string!",-123.5';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 3, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 3, "nodes": [
                    {"type": "xor", "index": 0, "size": 1, "nodes": [
                        {"type": "phrases", "index": 0, "size": 1, "nodes": [
                            {"type": "ast", "id": "string", "index": 0, "size": 1, "nodes": [
                                {"type": "symbols", "index": 0, "size": 1, "nodes": [
                                    {"id": "string", "length": 11, "text": "\"A string!\""}
                                ]}
                            ]}
                        ]}
                    ]},
                    {"type": "symbols", "index": 1, "size": 1, "nodes": [
                        {"id": "camma", "length": 1, "text": ","}
                    ]},
                    {"type": "xor", "index": 2, "size": 1, "nodes": [
                        {"type": "phrases", "index": 2, "size": 1, "nodes": [
                            {"type": "ast", "id": "number", "index": 2, "size": 1, "nodes": [
                                {"type": "symbols", "index": 2, "size": 1, "nodes": [
                                    {"id":"number","length":6,"text":"-123.5"}
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        );
    });
    it("Can parse using \"zero_or_more\"", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [[ "zero_or_more",
                [ "get_symbols", "string" ],
                [ "get_symbols", "camma" ]
            ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string",\'another sting\',"a third string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 5, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 5, "nodes": [
                    {"type": "zero_or_more", "index": 0, "size": 5, "nodes": [
                        {"type": "symbols", "index": 0, "size": 1, "nodes": [
                            {"id": "string", "length": 10, "text": "\"A string\""}
                        ]},
                        {"type": "symbols", "index": 1, "size": 1, "nodes": [
                            {"id": "camma", "length": 1, "text": ","}
                        ]},
                        {"type": "symbols", "index": 2, "size": 1, "nodes": [
                            {"id": "string", "length": 15, "text": "'another sting'"}
                        ]},
                        {"type": "symbols", "index": 3, "size": 1, "nodes": [
                            {"id": "camma", "length":1, "text": ","}
                        ]},
                        {"type": "symbols", "index": 4, "size": 1, "nodes": [
                            {"id": "string", "length": 16, "text": "\"a third string\""}
                        ]}
                    ]}
                ]}
            ]}
        );
    });
    it("Can parse using \"one_or_more\"", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
            {"id": "camma", "exp": /^,/},
        ];
        var p = [
            { "id": "program", "parse": [[ "one_or_more",
                [ "get_symbols", "string" ],
                [ "get_symbols", "camma" ]
            ]], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string",\'another sting\',"a third string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 5, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 5, "nodes": [
                    {"type": "one_or_more", "index": 0, "size": 5, "nodes": [
                        {"type": "symbols", "index": 0, "size": 1, "nodes": [
                            {"id": "string", "length": 10, "text": "\"A string\""}
                        ]},
                        {"type": "symbols", "index": 1, "size": 1, "nodes": [
                            {"id": "camma", "length": 1, "text": ","}
                        ]},
                        {"type": "symbols", "index": 2, "size": 1, "nodes": [
                            {"id": "string", "length": 15, "text": "'another sting'"}
                        ]},
                        {"type": "symbols", "index": 3, "size": 1, "nodes": [
                            {"id": "camma", "length":1, "text": ","}
                        ]},
                        {"type": "symbols", "index": 4, "size": 1, "nodes": [
                            {"id": "string", "length": 16, "text": "\"a third string\""}
                        ]}
                    ]}
                ]}
            ]}
        );
    });
    it("Can parse using \"optional\"", function() {
        var s = [
            {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
            {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        ];
        var p = [
            { "id": "program", "parse": [
                [ "optional", [ "get_symbols",  "string" ]],
                [ "optional", [ "get_symbols",  "string" ]],
            ], }
        ];
        var gp = new GP.create(s, p);
        var str = '"A string"';
        var ast = gp.parse(str, false);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type": "program", "index": 0, "size": 1, "nodes": [
                {"type": "ast", "id": "program", "index": 0, "size": 1, "nodes": [
                    {"type": "optional", "index": 0, "size": 1, "nodes": [
                        {"type": "symbols", "index": 0, "size": 1, "nodes": [
                            {"id": "string", "length": 10, "text": "\"A string\""}  
                        ]}
                    ]},
                    {"type": "optional", "index": 1, "size": 0, "nodes": []}
                ]}
            ]}
        );
    });

    var json_symbols = [
        {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
        {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        {"id": "left brace", "exp": /^\{/},
        {"id": "right brace", "exp": /^\}/},
        {"id": "left bracket", "exp": /^\[/},
        {"id": "right bracket", "exp": /^]/},
        {"id": "number", "exp": /^(-?)(\d+)((\.\d+)?)/},
        {"id": "bool", "exp": /^true/},
        {"id": "bool", "exp": /^false/},
        {"id": "null", "exp": /^null/},
        {"id": "whitespace", "exp": /^\s+/},
        {"id": "camma", "exp": /^,/},
        {"id": "colon", "exp": /^:/},
    ];
    var json_phrases = [
        {
            "id": "program",
            "parse": [
                [ "get_phrases", "statement" ]
            ],
        },
        {
            "id": "statement",
            "parse": [
                [ "xor",
                    [ "get_phrases", "string" ],
                    [ "get_phrases", "object" ],
                    [ "get_phrases", "number" ],
                    [ "get_phrases", "array" ],
                    [ "get_phrases", "bool" ],
                    [ "get_phrases", "null" ],
                ]
            ]
        },
        {
            "id": "string",
            "parse": [
                [ "get_symbols", "string" ],
            ]
        },
        {
            "id": "object",
            "parse": [
                [ "get_symbols", "left brace" ],
                [ "zero_or_more",
                    [ "get_phrases", "object_key_value_pair" ],
                    [ "get_symbols", "camma" ],
                ],
                [ "get_symbols", "right brace" ],
            ]
        },
        {
            "id": "object_key_value_pair",
            "parse": [
                [ "optional", [ "get_symbols", "whitespace"] ],
                [ "get_symbols", "string" ],
                [ "optional", [ "get_symbols", "whitespace"] ],
                [ "get_symbols", "colon" ],
                [ "optional", [ "get_symbols", "whitespace"] ],
                [ "get_phrases", "statement" ],
                [ "optional", [ "get_symbols", "whitespace"] ],
             ],
        },
        {
            "id": "number",
            "parse": [
                [ "get_symbols", "number" ],
            ]
        },
        {
            "id": "array",
            "parse": [
                [ "get_symbols", "left bracket" ],
                [ "zero_or_more",
                    [ "and",
                        [ "optional", [ "get_symbols", "whitespace"] ],
                        [ "get_phrases", "statement" ],
                        [ "optional", [ "get_symbols", "whitespace"] ],
                    ],
                    [ "get_symbols", "camma" ],
                ],
                [ "get_symbols", "right bracket" ],
            ]
        },
        {
            "id": "bool",
            "parse": [
                [ "get_symbols", "bool" ],
            ]
        },
        {
            "id": "null",
            "parse": [
                [ "get_symbols", "null" ],
            ]
        }
    ];
    it("Can parse a string of JSON", function() {
        var gp = new GP.create(json_symbols, json_phrases);
        var str = JSON.stringify({
            number: -12345.06789,
            "string": "\"'\'confuse the parser\\\"",
            "booleans": [true, false],
            empty: null,
        });
        var ast = gp.parse(str, false);
        expect(JSON.stringify(ast)).toEqual(
'{"type":"program","index":0,"size":21,"nodes":[{"type":"ast","id":"program","index":0,"size":21,"nodes":[{"type":"phrases","index":0,"size":21,"nodes":[{"type":"ast","id":"statement","index":0,"size":21,"nodes":[{"type":"xor","index":0,"size":21,"nodes":[{"type":"phrases","index":0,"size":21,"nodes":[{"type":"ast","id":"object","index":0,"size":21,"nodes":[{"type":"symbols","index":0,"size":1,"nodes":[{"id":"left brace","length":1,"text":"{"}]},{"type":"zero_or_more","index":1,"size":19,"nodes":[{"type":"phrases","index":1,"size":3,"nodes":[{"type":"ast","id":"object_key_value_pair","index":1,"size":3,"nodes":[{"type":"optional","index":1,"size":0,"nodes":[]},{"type":"symbols","index":1,"size":1,"nodes":[{"id":"string","length":8,"text":"\\"number\\""}]},{"type":"optional","index":2,"size":0,"nodes":[]},{"type":"symbols","index":2,"size":1,"nodes":[{"id":"colon","length":1,"text":":"}]},{"type":"optional","index":3,"size":0,"nodes":[]},{"type":"phrases","index":3,"size":1,"nodes":[{"type":"ast","id":"statement","index":3,"size":1,"nodes":[{"type":"xor","index":3,"size":1,"nodes":[{"type":"phrases","index":3,"size":1,"nodes":[{"type":"ast","id":"number","index":3,"size":1,"nodes":[{"type":"symbols","index":3,"size":1,"nodes":[{"id":"number","length":12,"text":"-12345.06789"}]}]}]}]}]}]},{"type":"optional","index":4,"size":0,"nodes":[]}]}]},{"type":"symbols","index":4,"size":1,"nodes":[{"id":"camma","length":1,"text":","}]},{"type":"phrases","index":5,"size":3,"nodes":[{"type":"ast","id":"object_key_value_pair","index":5,"size":3,"nodes":[{"type":"optional","index":5,"size":0,"nodes":[]},{"type":"symbols","index":5,"size":1,"nodes":[{"id":"string","length":8,"text":"\\"string\\""}]},{"type":"optional","index":6,"size":0,"nodes":[]},{"type":"symbols","index":6,"size":1,"nodes":[{"id":"colon","length":1,"text":":"}]},{"type":"optional","index":7,"size":0,"nodes":[]},{"type":"phrases","index":7,"size":1,"nodes":[{"type":"ast","id":"statement","index":7,"size":1,"nodes":[{"type":"xor","index":7,"size":1,"nodes":[{"type":"phrases","index":7,"size":1,"nodes":[{"type":"ast","id":"string","index":7,"size":1,"nodes":[{"type":"symbols","index":7,"size":1,"nodes":[{"id":"string","length":28,"text":"\\"\\\\\\"\'\'confuse the parser\\\\\\\\\\\\\\"\\""}]}]}]}]}]}]},{"type":"optional","index":8,"size":0,"nodes":[]}]}]},{"type":"symbols","index":8,"size":1,"nodes":[{"id":"camma","length":1,"text":","}]},{"type":"phrases","index":9,"size":7,"nodes":[{"type":"ast","id":"object_key_value_pair","index":9,"size":7,"nodes":[{"type":"optional","index":9,"size":0,"nodes":[]},{"type":"symbols","index":9,"size":1,"nodes":[{"id":"string","length":10,"text":"\\"booleans\\""}]},{"type":"optional","index":10,"size":0,"nodes":[]},{"type":"symbols","index":10,"size":1,"nodes":[{"id":"colon","length":1,"text":":"}]},{"type":"optional","index":11,"size":0,"nodes":[]},{"type":"phrases","index":11,"size":5,"nodes":[{"type":"ast","id":"statement","index":11,"size":5,"nodes":[{"type":"xor","index":11,"size":5,"nodes":[{"type":"phrases","index":11,"size":5,"nodes":[{"type":"ast","id":"array","index":11,"size":5,"nodes":[{"type":"symbols","index":11,"size":1,"nodes":[{"id":"left bracket","length":1,"text":"["}]},{"type":"zero_or_more","index":12,"size":3,"nodes":[{"type":"and","index":12,"size":1,"nodes":[{"type":"optional","index":12,"size":0,"nodes":[]},{"type":"phrases","index":12,"size":1,"nodes":[{"type":"ast","id":"statement","index":12,"size":1,"nodes":[{"type":"xor","index":12,"size":1,"nodes":[{"type":"phrases","index":12,"size":1,"nodes":[{"type":"ast","id":"bool","index":12,"size":1,"nodes":[{"type":"symbols","index":12,"size":1,"nodes":[{"id":"bool","length":4,"text":"true"}]}]}]}]}]}]},{"type":"optional","index":13,"size":0,"nodes":[]}]},{"type":"symbols","index":13,"size":1,"nodes":[{"id":"camma","length":1,"text":","}]},{"type":"and","index":14,"size":1,"nodes":[{"type":"optional","index":14,"size":0,"nodes":[]},{"type":"phrases","index":14,"size":1,"nodes":[{"type":"ast","id":"statement","index":14,"size":1,"nodes":[{"type":"xor","index":14,"size":1,"nodes":[{"type":"phrases","index":14,"size":1,"nodes":[{"type":"ast","id":"bool","index":14,"size":1,"nodes":[{"type":"symbols","index":14,"size":1,"nodes":[{"id":"bool","length":5,"text":"false"}]}]}]}]}]}]},{"type":"optional","index":15,"size":0,"nodes":[]}]}]},{"type":"symbols","index":15,"size":1,"nodes":[{"id":"right bracket","length":1,"text":"]"}]}]}]}]}]}]},{"type":"optional","index":16,"size":0,"nodes":[]}]}]},{"type":"symbols","index":16,"size":1,"nodes":[{"id":"camma","length":1,"text":","}]},{"type":"phrases","index":17,"size":3,"nodes":[{"type":"ast","id":"object_key_value_pair","index":17,"size":3,"nodes":[{"type":"optional","index":17,"size":0,"nodes":[]},{"type":"symbols","index":17,"size":1,"nodes":[{"id":"string","length":7,"text":"\\"empty\\""}]},{"type":"optional","index":18,"size":0,"nodes":[]},{"type":"symbols","index":18,"size":1,"nodes":[{"id":"colon","length":1,"text":":"}]},{"type":"optional","index":19,"size":0,"nodes":[]},{"type":"phrases","index":19,"size":1,"nodes":[{"type":"ast","id":"statement","index":19,"size":1,"nodes":[{"type":"xor","index":19,"size":1,"nodes":[{"type":"phrases","index":19,"size":1,"nodes":[{"type":"ast","id":"null","index":19,"size":1,"nodes":[{"type":"symbols","index":19,"size":1,"nodes":[{"id":"null","length":4,"text":"null"}]}]}]}]}]}]},{"type":"optional","index":20,"size":0,"nodes":[]}]}]}]},{"type":"symbols","index":20,"size":1,"nodes":[{"id":"right brace","length":1,"text":"}"}]}]}]}]}]}]}]}]}'
        );
    });
    it("Can parse a string of JSON and use compressor function", function() {
        var gp = new GP.create(json_symbols, json_phrases);
        var str = JSON.stringify({
            number: -12345.06789,
            "string": "\"'\'confuse the parser\\\"",
            "booleans": [true, false],
            empty: null,
        });
        var ast = gp.parse(str);
        expect(JSON.parse(JSON.stringify(ast))).toEqual(
            {"type":"program","index":0,"size":21,"nodes":[
                {"type":"phrases","index":0,"size":21,"nodes":[
                    {"type":"phrases","index":0,"size":21,"nodes":[
                        {"type":"symbols","index":0,"size":1,"nodes":[
                            {"id":"left brace","length":1,"text":"{"}
                        ]},
                        {"type":"phrases","index":1,"size":3,"nodes":[
                            {"type":"symbols","index":1,"size":1,"nodes":[
                                {"id":"string","length":8,"text":"\"number\""}
                            ]},
                            {"type":"symbols","index":2,"size":1,"nodes":[
                                {"id":"colon","length":1,"text":":"}
                            ]},
                            {"type":"phrases","index":3,"size":1,"nodes":[
                                {"type":"phrases","index":3,"size":1,"nodes":[
                                    {"type":"symbols","index":3,"size":1,"nodes":[
                                        {"id":"number","length":12,"text":"-12345.06789"}
                                    ]}
                                ],"id":"number"}
                            ],"id":"statement"}
                        ],"id":"object_key_value_pair"},
                        {"type":"symbols","index":4,"size":1,"nodes":[
                            {"id":"camma","length":1,"text":","}
                        ]},
                        {"type":"phrases","index":5,"size":3,"nodes":[
                            {"type":"symbols","index":5,"size":1,"nodes":[
                                {"id":"string","length":8,"text":"\"string\""}
                            ]},
                            {"type":"symbols","index":6,"size":1,"nodes":[
                                {"id":"colon","length":1,"text":":"}
                            ]},
                            {"type":"phrases","index":7,"size":1,"nodes":[
                                {"type":"phrases","index":7,"size":1,"nodes":[
                                    {"type":"symbols","index":7,"size":1,"nodes":[
                                        {"id":"string","length":28,"text":"\"\\\"''confuse the parser\\\\\\\"\""}
                                    ]}
                                ],"id":"string"}
                            ],"id":"statement"}
                        ],"id":"object_key_value_pair"},
                        {"type":"symbols","index":8,"size":1,"nodes":[
                            {"id":"camma","length":1,"text":","}
                        ]},
                        {"type":"phrases","index":9,"size":7,"nodes":[
                            {"type":"symbols","index":9,"size":1,"nodes":[
                                {"id":"string","length":10,"text":"\"booleans\""}
                            ]},
                            {"type":"symbols","index":10,"size":1,"nodes":[
                                {"id":"colon","length":1,"text":":"}
                            ]},
                            {"type":"phrases","index":11,"size":5,"nodes":[
                                {"type":"phrases","index":11,"size":5,"nodes":[
                                    {"type":"symbols","index":11,"size":1,"nodes":[
                                        {"id":"left bracket","length":1,"text":"["}
                                    ]},
                                    {"type":"phrases","index":12,"size":1,"nodes":[
                                        {"type":"phrases","index":12,"size":1,"nodes":[
                                            {"type":"symbols","index":12,"size":1,"nodes":[
                                                {"id":"bool","length":4,"text":"true"}
                                            ]}
                                        ],"id":"bool"}
                                    ],"id":"statement"},
                                    {"type":"symbols","index":13,"size":1,"nodes":[
                                        {"id":"camma","length":1,"text":","}
                                    ]},
                                    {"type":"phrases","index":14,"size":1,"nodes":[
                                        {"type":"phrases","index":14,"size":1,"nodes":[
                                            {"type":"symbols","index":14,"size":1,"nodes":[
                                                {"id":"bool","length":5,"text":"false"}
                                            ]}
                                        ],"id":"bool"}
                                    ],"id":"statement"},
                                    {"type":"symbols","index":15,"size":1,"nodes":[
                                        {"id":"right bracket","length":1,"text":"]"}
                                    ]}
                                ],"id":"array"}
                            ],"id":"statement"}
                        ],"id":"object_key_value_pair"},
                        {"type":"symbols","index":16,"size":1,"nodes":[
                            {"id":"camma","length":1,"text":","}
                        ]},
                        {"type":"phrases","index":17,"size":3,"nodes":[
                            {"type":"symbols","index":17,"size":1,"nodes":[
                                {"id":"string","length":7,"text":"\"empty\""}
                            ]},
                            {"type":"symbols","index":18,"size":1,"nodes":[
                                {"id":"colon","length":1,"text":":"}
                            ]},
                            {"type":"phrases","index":19,"size":1,"nodes":[
                                {"type":"phrases","index":19,"size":1,"nodes":[
                                    {"type":"symbols","index":19,"size":1,"nodes":[
                                        {"id":"null","length":4,"text":"null"}
                                    ]}
                                ],"id":"null"}
                            ],"id":"statement"}
                        ],"id":"object_key_value_pair"},
                        {"type":"symbols","index":20,"size":1,"nodes":[
                            {"id":"right brace","length":1,"text":"}"}
                        ]}
                    ],"id":"object"}
                ],"id":"statement"}
            ],"id":"program"}
        );
    });
});
