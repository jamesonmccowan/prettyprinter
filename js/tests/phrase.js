describe("The \"Phrase\" function", function() {
    var actions = [
        [ "get_symbols",  "function" ],
        [ "get_phrases",  "parens"   ],
        [ "and",          [ "get_symbols", "blah" ] ],
        [ "or",           [ "get_symbols", "blah" ] ],
        [ "xor",          [ "get_symbols", "blah" ] ],
        [ "zero_or_more", [ "get_symbols", "blah" ] ],
        [ "one_or_more",  [ "get_symbols", "blah" ] ],
        [ "optional",     [ "get_symbols", "blah" ] ]
    ];
    for (var i=0;i<actions.length;i++) {
        (function (a) {
            it("Can create a \"" + a[0] + "\" phrase", function() {
                var p = new GP.Phrase("test", [a]);
                expect(typeof p == "object").toBe(true);
                expect(p.parse).toEqual([a]);
                p = new GP.Phrase({"id": "test", "parse": [a]});
                expect(typeof p == "object").toBe(true);
                expect(p.parse).toEqual([a]);
            });
        })(actions[i]);
    }
    actions = [
        [ "undefined parse variable", null,
          {
            "object": { "id": "test" },
            "message": 'Test Parse Error: Expected Array',
            "status": {"parse": null}
          }
        ],
        [ "empty parse array", [],
          {
            "object": { "id": "test" },
            "message": 'Test Parse Error: No actions in Parse list',
            "status": {"parse": [ ]}
          }
        ],
        [ "string", "string",
          {
            "object": { "id": "test" },
            "message": 'Test Parse Error: Expected Array',
            "status": {"parse": 'string'}
          }
        ],
        [ "unknown actions in parse array", [[ "random", "blah" ]],
          {
            "object": { "id": "test" },
            "message": 'Test Parse Error: Unrecognized Action "random"',
            "status": {"action": 'random' }
          }
        ],
        [ "deeper levels", [[ "and", ["and", []] ]],
          {
            "object": { "id": "test" },
            "message": "Test Parse Error: \"and\" expected array doesn't have enough elements",
            "status": {}
          }
        ],
    ];
    for (var i=0;i<actions.length;i++) {
        var s = actions[i][0];
        var a = actions[i][1];
        var e = actions[i][2];
        (function (s, a, e) {
            it("Throws Errors for " + s, function () {
                var error;
                try {
                    var p = new GP.Phrase("test", a);
                } catch (err) {
                    error = JSON.parse(JSON.stringify(err));
                }
                expect(error).toEqual(e);

                try {
                    var p = new GP.Phrase({"id": "test", "parse": a});
                } catch (err) {
                    error = JSON.parse(JSON.stringify(err));
                }
                expect(error).toEqual(e);
            });
        })(s, a, e);
    }
});
