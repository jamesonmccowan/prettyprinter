describe("The Parser Object's Print Functions", function() {
    var json_symbols = [
        {"id": "string", "exp": /^'(([^'\\])|(\\.))*'/},
        {"id": "string", "exp": /^"(([^"\\])|(\\.))*"/},
        {"id": "left-brace", "exp": /^\{/},
        {"id": "right-brace", "exp": /^\}/},
        {"id": "left-bracket", "exp": /^\[/},
        {"id": "right-bracket", "exp": /^]/},
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
                [ "get_symbols", "left-brace" ],
                [ "zero_or_more",
                    [ "get_phrases", "object_key_value_pair" ],
                    [ "get_symbols", "camma" ],
                ],
                [ "get_symbols", "right-brace" ],
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
                [ "get_symbols", "left-bracket" ],
                [ "zero_or_more",
                    [ "and",
                        [ "optional", [ "get_symbols", "whitespace"] ],
                        [ "get_phrases", "statement" ],
                        [ "optional", [ "get_symbols", "whitespace"] ],
                    ],
                    [ "get_symbols", "camma" ],
                ],
                [ "get_symbols", "right-bracket" ],
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
    it("Can convert an AST back into the original text", function() {
        var gp = new GP.create(json_symbols, json_phrases);
        var str = JSON.stringify({
            number: -12345.06789,
            "string": "\"'\'confuse the parser\\\"",
            "booleans": [true, false],
            empty: null,
        });
        var ast = gp.parse(str);
        var print_str = gp.print_ast(ast);
        expect(print_str).toEqual(str);
    });
    it("Can convert an AST back into the original text plus HTML", function() {
        var gp = new GP.create(json_symbols, json_phrases);
        var str = '{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": null\n}';
        var ast = gp.parse(str);
        var print_str = gp.print_ast(ast, true);
        expect(print_str).toEqual(
          '<span class="node-program phrase-program">'+
            '<span class="node-phrases phrase-statement">'+
              '<span class="node-phrases phrase-object">'+
                '<span class="node-symbols">'+
                  '<span class="symbol-left-brace">{</span>'+
                '</span>'+
                '<span class="node-phrases phrase-object_key_value_pair">'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace">\n    </span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-string">"number"</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-colon">:</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace"> </span>'+
                  '</span>'+
                  '<span class="node-phrases phrase-statement">'+
                    '<span class="node-phrases phrase-number">'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-number">-12345.06789</span>'+
                      '</span>'+
                    '</span>'+
                  '</span>'+
                '</span>'+
                '<span class="node-symbols">'+
                  '<span class="symbol-camma">,</span>'+
                '</span>'+
                '<span class="node-phrases phrase-object_key_value_pair">'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace">\n    </span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-string">"string"</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-colon">:</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace"> </span>'+
                  '</span>'+
                  '<span class="node-phrases phrase-statement">'+
                    '<span class="node-phrases phrase-string">'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-string">"\\"\'\\\'confuse the parser\\\\\\""</span>'+
                      '</span>'+
                    '</span>'+
                  '</span>'+
                '</span>'+
                '<span class="node-symbols">'+
                  '<span class="symbol-camma">,</span>'+
                '</span>'+
                '<span class="node-phrases phrase-object_key_value_pair">'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace">\n    </span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-string">"booleans"</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-colon">:</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace"> </span>'+
                  '</span>'+
                  '<span class="node-phrases phrase-statement">'+
                    '<span class="node-phrases phrase-array">'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-left-bracket">[</span>'+
                      '</span>'+
                      '<span class="node-phrases phrase-statement">'+
                        '<span class="node-phrases phrase-bool">'+
                          '<span class="node-symbols">'+
                            '<span class="symbol-bool">true</span>'+
                          '</span>'+
                        '</span>'+
                      '</span>'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-camma">,</span>'+
                      '</span>'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-whitespace"> </span>'+
                      '</span>'+
                      '<span class="node-phrases phrase-statement">'+
                        '<span class="node-phrases phrase-bool">'+
                          '<span class="node-symbols">'+
                            '<span class="symbol-bool">false</span>'+
                          '</span>'+
                        '</span>'+
                      '</span>'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-right-bracket">]</span>'+
                      '</span>'+
                    '</span>'+
                  '</span>'+
                '</span>'+
                '<span class="node-symbols">'+
                  '<span class="symbol-camma">,</span>'+
                '</span>'+
                '<span class="node-phrases phrase-object_key_value_pair">'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace">\n   </span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-string">"empty"</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-colon">:</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace"> </span>'+
                  '</span>'+
                  '<span class="node-phrases phrase-statement">'+
                    '<span class="node-phrases phrase-null">'+
                      '<span class="node-symbols">'+
                        '<span class="symbol-null">null</span>'+
                      '</span>'+
                    '</span>'+
                  '</span>'+
                  '<span class="node-symbols">'+
                    '<span class="symbol-whitespace">\n</span>'+
                  '</span>'+
                '</span>'+
                '<span class="node-symbols">'+
                  '<span class="symbol-right-brace">}</span>'+
                '</span>'+
              '</span>'+
            '</span>'+
          '</span>'
        );
    });
    it("pretty_print can replicate print_ast", function() {
        var gp = new GP.create(json_symbols, json_phrases);
        var str = '{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": null\n}';
        var ast = gp.parse(str);
        var print_str = gp.print_ast(ast, false);
        var pretty_print_str = gp.pretty_print(str, false);
        expect(print_str).toEqual(pretty_print_str);

        ast = gp.parse(str);
        pretty_print_str = gp.pretty_print(str, true);
        print_str = gp.print_ast(ast, true);
        expect(print_str).toEqual(pretty_print_str);
    });
    it("pretty_print has working working rule functions", function() {
        var print_rules = [
            {"id":"#null",  "ignore": true,},
            {"id":".right-brace", "ignore": true,}
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        expect(gp.pretty_print_table).toEqual({
            "#null": { "id": '#null', "ignore": true },
            ".right-brace": { "id": '.right-brace', "ignore": true }
        });
        expect(gp.pretty_print_list).toEqual(print_rules);

        var new_rule = { "id": '#test' };
        gp.add_pretty_print_rule(new_rule);
        expect(gp.pretty_print_table).toEqual({
            "#null": { "id": '#null', "ignore": true },
            ".right-brace": { "id": '.right-brace', "ignore": true },
            "#test": new_rule
        });
        expect(gp.pretty_print_list).toEqual([
            { "id": '#null', "ignore": true },
            { "id": '.right-brace', "ignore": true },
            new_rule
        ]);

        gp.remove_pretty_print_rule(new_rule.id);
        expect(gp.pretty_print_table).toEqual({
            "#null": { "id": '#null', "ignore": true },
            ".right-brace": { "id": '.right-brace', "ignore": true }
        });
        expect(gp.pretty_print_list).toEqual(print_rules);
    });
    it("pretty_print can get rules", function() {
        var print_rules = [
            {"id":"#null",  "ignore": true,},
            {"id":".right-brace", "ignore": false,},
            {"id":"#null .right-brace", "indent": "  ",},
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        var rules = gp.get_pretty_print_rules();
        expect(JSON.parse(JSON.stringify(rules))).toEqual({});

        rules = gp.get_pretty_print_rules("#null");
        expect(JSON.parse(JSON.stringify(rules))).toEqual({ "ignore": true });

        rules = gp.get_pretty_print_rules(".right-brace");
        expect(JSON.parse(JSON.stringify(rules))).toEqual({ "ignore": false });

        // nested rules
        rules = gp.get_pretty_print_rules("#null .right-brace");
        expect(JSON.parse(JSON.stringify(rules))).toEqual({ "ignore": false, "indent": "  " });

    });
    it("pretty_print can ignore phrases and symbols", function() {
        var print_rules = [
            {"id":"#null",  "ignore": true,},
            {"id":".right-brace", "ignore": true,}
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        var str = '{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": null\n}';
        var pretty_print_str = gp.pretty_print(str, false);
        expect(pretty_print_str).toEqual('{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": \n');
        pretty_print_str = gp.pretty_print(str, true);
        expect(pretty_print_str).toEqual(
'<span class="node-program phrase-program">'+
  '<span class="node-phrases phrase-statement">'+
    '<span class="node-phrases phrase-object">'+
      '<span class="node-symbols">'+
        '<span class="symbol-left-brace">{</span>'+
      '</span>'+
      '<span class="node-phrases phrase-object_key_value_pair">'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace">\n    </span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-string">"number"</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-colon">:</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace"> </span>'+
        '</span>'+
        '<span class="node-phrases phrase-statement">'+
          '<span class="node-phrases phrase-number">'+
            '<span class="node-symbols">'+
              '<span class="symbol-number">-12345.06789</span>'+
            '</span>'+
          '</span>'+
        '</span>'+
      '</span>'+
      '<span class="node-symbols">'+
        '<span class="symbol-camma">,</span>'+
      '</span>'+
      '<span class="node-phrases phrase-object_key_value_pair">'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace">\n    </span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-string">"string"</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-colon">:</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace"> </span>'+
        '</span>'+
        '<span class="node-phrases phrase-statement">'+
          '<span class="node-phrases phrase-string">'+
            '<span class="node-symbols">'+
              '<span class="symbol-string">"\\"\'\\\'confuse the parser\\\\\\""</span>'+
            '</span>'+
          '</span>'+
        '</span>'+
      '</span>'+
      '<span class="node-symbols">'+
        '<span class="symbol-camma">,</span>'+
      '</span>'+
      '<span class="node-phrases phrase-object_key_value_pair">'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace">\n    </span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-string">"booleans"</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-colon">:</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace"> </span>'+
        '</span>'+
        '<span class="node-phrases phrase-statement">'+
          '<span class="node-phrases phrase-array">'+
            '<span class="node-symbols">'+
              '<span class="symbol-left-bracket">[</span>'+
            '</span>'+
            '<span class="node-phrases phrase-statement">'+
              '<span class="node-phrases phrase-bool">'+
                '<span class="node-symbols">'+
                  '<span class="symbol-bool">true</span>'+
                '</span>'+
              '</span>'+
            '</span>'+
            '<span class="node-symbols">'+
              '<span class="symbol-camma">,</span>'+
            '</span>'+
            '<span class="node-symbols">'+
              '<span class="symbol-whitespace"> </span>'+
            '</span>'+
            '<span class="node-phrases phrase-statement">'+
              '<span class="node-phrases phrase-bool">'+
                '<span class="node-symbols">'+
                  '<span class="symbol-bool">false</span>'+
                '</span>'+
              '</span>'+
            '</span>'+
            '<span class="node-symbols">'+
              '<span class="symbol-right-bracket">]</span>'+
            '</span>'+
          '</span>'+
        '</span>'+
      '</span>'+
      '<span class="node-symbols">'+
        '<span class="symbol-camma">,</span>'+
      '</span>'+
      '<span class="node-phrases phrase-object_key_value_pair">'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace">\n   </span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-string">"empty"</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-colon">:</span>'+
        '</span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace"> </span>'+
        '</span>'+
        '<span class="node-phrases phrase-statement"></span>'+
        '<span class="node-symbols">'+
          '<span class="symbol-whitespace">\n</span>'+
        '</span>'+
      '</span>'+
      '<span class="node-symbols">'+
      '</span>'+
    '</span>'+
  '</span>'+
'</span>');
    });
    it("pretty_print can indent and newline", function() {
        var print_rules = [
            {"id":"#object_key_value_pair", "newline": true, "indent": "    ",},
            {"id":".whitespace", "ignore": true,},
            {"id":".right-brace", "newline":true, "indent":" ",}
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        var str = '{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": null\n}';
        var pretty_print_str = gp.pretty_print(str, false);
        expect(pretty_print_str).toEqual(
            '{\n'+
            '    "number":-12345.06789,\n'+
            '    "string":"\\"\'\\\'confuse the parser\\\\\\"",\n'+
            '    "booleans":[true,false],\n'+
            '    "empty":null\n'+
            ' }'
        );
    });
    it("pretty_print can pad-left and pad-right", function() {
        var print_rules = [
            {"id":".whitespace", "ignore": true,},
            {"id":".colon", "pad-left": " ", "pad-right": " ",},
            {"id":".camma", "pad-right":" ",}
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        var str = '{\n    "number": -12345.06789,\n    "string": "\\"\'\\\'confuse the parser\\\\\\"",\n    "booleans": [true, false],\n   "empty": null\n}';
        var pretty_print_str = gp.pretty_print(str, false);
        expect(pretty_print_str).toEqual(
            '{"number" : -12345.06789, "string" : "\\"\'\\\'confuse the parser\\\\\\"", "booleans" : [true, false], "empty" : null}'
        );
    });
    it("pretty_print errors on bad values for add_pretty_print_rule", function() {
        var print_rules = [
            {"id":"#null",  "ignore": true,},
            {"id":".right-brace", "ignore": true,}
        ];
        var gp = new GP.create(json_symbols, json_phrases, print_rules);
        var error;

        try {
            gp.add_pretty_print_rule();
        } catch (e) {
            error = e;
        }
        expect(JSON.parse(JSON.stringify(error))).toEqual({
            "object": null,
            "message": 'Pretty Print Error: Cannot add type "undefined" as pretty print rule',
            "status": { }
        });
        expect(gp.pretty_print_list).toEqual(print_rules);

        try {
            gp.add_pretty_print_rule({ "id": true });
        } catch (e) {
            error = e;
        }
        expect(JSON.parse(JSON.stringify(error))).toEqual({
            "object": null,
            "message": 'Pretty Print Error: Cannot add pretty print rule without a valid id',
            "status": { "rule": { "id": true } }
        });
        expect(gp.pretty_print_list).toEqual(print_rules);
    });
    it("pretty_print errors on wrong type for first argument", function() {
        var gp = new GP.create([], [], []);
        var error;
        try {
            gp.pretty_print(true);
        } catch (e) {
            error = e;
        }
        expect(JSON.parse(JSON.stringify(error))).toEqual({
            "object": null,
            "message": 'Pretty Print Error: Expected Object or String, got type "boolean"',
            "status": { "str": true }
        });
    });
});
