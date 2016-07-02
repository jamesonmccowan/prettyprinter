var json_parser = (function () {
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
                [ "optional", [ "get_symbols", "whitespace"] ],
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
                [ "optional", [ "get_symbols", "whitespace"] ],
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
    var pretty_print = [
        {"id":"#object_key_value_pair", "newline": true, "indent": "    ",},
        {"id":".whitespace", "ignore": true,},
        {"id":".right-brace", "newline":true,},
        {"id":".colon", "pad-right":" ", "pad-left":" ",},
        {"id":".left-bracket", "pad-right":" ",},
        {"id":".right-bracket", "pad-left":" ",},
        {"id":"#array .camma", "pad-right":" ",},
    ];
    var gp = new GP.create(json_symbols, json_phrases, pretty_print);
    gp.name = "JSON";
    return gp;
})()
