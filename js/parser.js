window.GP = (function () {
    var gp = {};

    // helper functions
    function each(obj, func) {
        if (typeof func == "function") {
            var ret;
            if (typeof obj == "object") {
                if (typeof obj.test == "function" && typeof obj.exec == "function") {
                    ret = func.call(obj, obj);
                    if (typeof ret != "undefined") {
                        obj = ret;
                    }
                } else if (Array.isArray(obj)) {
                    for (var i=0;i<obj.length;i++) {
                        ret = func.call(obj, obj[i], i);
                        if (typeof ret != "undefined") {
                            obj[i] = ret;
                        }
                    }
                } else {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            ret = func.call(obj, obj[key], key);
                            if (typeof ret != "undefined") {
                                obj[key] = ret;
                            }
                        }
                    }
                }
            } else {
                ret = func.call(obj, obj);
                if (typeof ret != "undefined") {
                    obj = ret;
                }
            }
        }
    }
    gp.each = each;

    function map(obj, func, that) {
        if (typeof func == "function") {
            if (typeof obj == "object") {
                var ret = {};
                if (Array.isArray(obj)) {
                    ret = obj.map(func, that);
                } else {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            ret[key] = func.call(that, obj[key], key, obj);
                        }
                    }
                }
                return ret;
            } else {
                return func.call(that, obj);
            }
        }
    }
    gp.map = map;

    function error(obj, message, stats) {
        var e = {"object": obj||null, "message": message||"???", "status": stats||{}};
        throw e;
    }

    // Symbols: key words and characters that make up a language
    function Symbol(id, exp) {
        var self = this;
        if (typeof id == "object") {
            exp = id.exp;
            id = id.id;
        }
        if (typeof id == "string" && id.length > 0) {
            self.id = id;
        } else if (typeof id == "number") {
            self.id = ""+id;
        } else {
            this.error("Symbol needs to have an \"id\" of type string!");
        }

        self.exp = [];
        if (!exp) {
            self.error("Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!");
        }
        each(exp, function (exp) {
            if (typeof exp == "object" && typeof exp.test == "function") {
                self.exp.push(exp);
            } else if (typeof exp == "string") {
                self.exp.push(new RegExp(exp));
            } else {
                self.error("Symbol needs to have an \"exp\" of type regexp, or [regexp], or string!");
            }
        });
    }
    Symbol.prototype.match = function (str) {
        for (var i=0;i<this.exp.length;i++) {
            var match = str.match(this.exp[i]);
            if (match) {
                return {
                    "id": this.id,
                    "length": match[0].length,
                    "text": match[0],
                };
            }
        }
        return false;
    };
    Symbol.prototype.error = function (str, stats) {
        error(this, str, stats);
    };
    gp.Symbol = Symbol;

    // Phrase: groups of symbols that can be nested within eachother
    function Phrase(id, parse) {
        var self = this;
        if (typeof id == "object") {
            parse = id.parse;
            id = id.id;
        }
        if (typeof id == "string") {
            this.id = id;
        } else if (typeof id == "number") {
            this.id = ""+id;
        } else {
            this.error("Phrase needs to have an \"id\" of type string!", {"id": id});
        }

        function test_parse(action) {
            if (Array.isArray(action[0])) {
                for (var i=0;i<action.length;i++) {
                    test_parse(action[i]);
                }
            } else {
                switch (action[0]) {
                    case "get_symbols":
                    case "get_phrases":
                    case "and":
                    case "or":
                    case "xor":
                    case "zero_or_more":
                    case "one_or_more":
                    case "optional":
                        if (typeof action[1] != "string") {
                            if(!Array.isArray(action[1])) {
                                this.error("Test Parse Error: " + action[0] + " expected string or array!", {"action": action[1]});
                            }
                            if (action[1].length > 1) {
                                for (var i=1;i<action.length;i++) {
                                    test_parse(action[i]);
                                }
                            } else {
                                self.error("Test Parse Error: \"" + action[0] + "\" expected array doesn't have enough elements", {"action": action[i]});
                            }
                        }
                        break;
                    default:
                        self.error("Test Parse Error: Unrecognized Action \"" + action[0] + "\"", {"action": action[0]});
                }
            }
        }

        if (Array.isArray(parse)) {
            if (parse.length) {
                for (var i=0;i<parse.length;i++) {
                    test_parse(parse[i]);
                }
            } else {
                this.error("Test Parse Error: No actions in Parse list", {"parse": parse});
            }
        } else {
            this.error("Test Parse Error: Expected Array", {"parse": parse});
        }
        this.parse = parse;
    }
    Phrase.prototype.ast = function ast(symbols, index, phrase_table, ast) {
        var node = new AST_Node("ast", index, this.id);
        ast.push(node);
        for (var i=0;i<this.parse.length;i++) {
            var action = this.parse[i];
            var n = this[action[0]](action, symbols, index, phrase_table, node);
            node.size += n.size;
            index += n.size;
        }
        return node;
    }
    Phrase.prototype.get_symbols = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("symbols", index);
        ast.push(node);
        for (var i=1;i<action.length;i++) {
            if (typeof action[i] == "string") {
                if (action[i] == symbols[index].id) {
                    node.nodes.push(symbols[index]);
                    node.size++;
                    index++;
                } else {
                    this.error(
                        "Parse Error: expected symbol \"" + action[i] + "\", and got \"" + symbols[index].id + "\" instead",
                        {"action": action, "symbol": symbols[index], "index": index}
                    );
                }
            } else {
                this.error(
                    "Parse Error: bad symbol request",
                    {"action": action, "symbol": symbols[index], "index": index}
                );
            }
        }
        return node;
    };
    Phrase.prototype.get_phrases = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("phrases", index);
        ast.push(node);
        for (var i=1;i<action.length;i++) {
            if (typeof action[i] == "string") {
                if (typeof phrase_table[action[i]] == "object") {
                    var p = phrase_table[action[i]].ast(symbols, index, phrase_table, node);
                    node.size += p.size;
                    index += p.size;
                } else {
                    this.error(
                        "Parse Error: expected phrase \"" + action[i] + "\"",
                        {"action": action, "symbol": symbols[index], "index": index}
                    );
                }
            } else {
                this.error(
                    "Parse Error: bad phrase request",
                    {"action": action, "symbol": symbols[index], "index": index}
                );
            }
        }
        return node;
    };
    // should capture one of each phrase without caring about order
    Phrase.prototype.and = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("and", index);
        ast.push(node);
        var actions = action.slice(1);
        for (var i=0;i<actions.length;i++) {
             if (actions[i].length > 1) {
                try {
                    var n = this[actions[i][0]](actions[i], symbols, index, phrase_table, node);
                    node.size += n.size;
                    index += n.size;
                    actions.splice(i, 1);
                    i = -1;
                } catch (e) {
                    node.pop();
                }
             } else {
                this.error(
                    "Parse Error: \"And\" expected array with 2 or more elements",
                    {"action": action, "symbol": symbols[index], "index": index}
                );
             }
        }
        if (actions.length) {
            this.error(
                "Parse Error: \"And\" didn't find a match for every element",
                {"action": action, "symbol": symbols[index], "index": index, "unmatched": actions}
            );
        }
        return node;
    };
    // should capture one of each phrase until it can't mach more or runs out
    Phrase.prototype.or = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("or", index);
        ast.push(node);
        var actions = action.slice(1);
        for (var i=0;i<actions.length;i++) {
             if (actions[i].length > 1) {
                try {
                    var n = this[actions[i][0]](actions[i], symbols, index, phrase_table, node);
                    node.size += n.size;
                    index += n.size;
                    actions.splice(i, 1);
                    i = -1;
                } catch (e) {
                    node.pop();
                }
             } else {
                this.error(
                    "Parse Error: \"Or\" expected array with 2 or more elements",
                    {"action": action, "symbol": symbols[index], "index": index}
                );
             }
        }
        if (actions.length == action.length-1) {
            this.error(
                "Parse Error: \"Or\" didn't find a match for any element",
                {"action": action, "symbol": symbols[index], "index": index}
            );
        }
        return node;
    };
    // should capture one of the phrases then return
    Phrase.prototype.xor = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("xor", index);
        ast.push(node);
        var actions = action.slice(1);
        for (var i=0;i<actions.length;i++) {
            if (actions[i].length > 1) {
                try {
                    var n = this[actions[i][0]](actions[i], symbols, index, phrase_table, node);
                    node.size += n.size;
                    index += n.size;
                    actions.splice(i, 1);
                    i = actions.length; // exit loop
                } catch (e) {
                    node.pop();
                }
            } else {
                this.error(
                    "Parse Error: \"Xor\" expected array with 2 or more elements",
                    {"action": action, "symbol": symbols[index], "index": index, "unexpected": actions[i]}
                );
            }
        }
        if (actions.length == action.length-1) {
            this.error(
                "Parse Error: \"Xor\" didn't find a match for any element",
                {"action": action, "symbol": symbols[index], "index": index}
            );
        }
        return node;
    };
    Phrase.prototype.zero_or_more = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("zero_or_more", index);
        ast.push(node);
        var count = 0;
        var join_phrase = false;
        var infinite_loop_error_state = "Parse Error: zero_or_more didn't consume any symbols!"
        if (typeof action[2] == "object") {
            if (action[2].length > 1) {
                join_phrase = true;
            } else {
                this.error(
                    "Parse Error: zero_or_more expected join array with 2 or more elements",
                    {"action": action, "symbol": symbols[index], "index": index}
                );
            }
        }
        if (action[1].length > 1) {
            try {
                // iterate through phrases until we hit an error
                while (index < symbols.length) {
                    var start_index = index + 0;
                    var n = this[action[1][0]](action[1], symbols, index, phrase_table, node);
                    node.size += n.size;
                    index += n.size;
                    count++;
                    if (join_phrase) {
                        n = this[action[2][0]](action[2], symbols, index, phrase_table, node);
                        node.size += n.size;
                        index += n.size;
                        count++;
                    }
                    if (index == start_index) {
                        this.error(
                            infinite_loop_error_state,
                            {"action": action, "symbol": symbols[index], "index": index}
                        );
                    }
                }
            } catch (e) {
                node.pop();
                if (e.message == infinite_loop_error_state) {
                    // everything's fine, we've just broken out of the loop
                } else {
                    // there was an error when we tried to find more phrases then were there
                }
            }
            if (join_phrase) {
                if (count % 2 == 0 && count > 0) {
                    var l = s.last();
                    if(l.size > 0) {
                        // we've consumed one too many phrases, and the last one was optional or lacked any symbol
                        node.pop();
                    }
                }
            }
        } else {
            this.error(
                "Parse Error: zero_or_more expected array with 2 or more elements",
                {"action": action, "symbol": symbols[index], "index": index, "unexpected": action[1]}
            );
        }
        return node;
    };
    Phrase.prototype.one_or_more = function (action, symbols, index, phrase_table, ast) {
        var node = this.zero_or_more(action, symbols, index, phrase_table, ast);
        node.type = "one_or_more";
        if (node.size == 0) {
            this.error(
                "Parse Error: one_or_more didn't find any elements",
                {"action": action, "symbol": symbols[index], "index": index}
            );
        }
        return node;
    };
    Phrase.prototype.optional = function (action, symbols, index, phrase_table, ast) {
        var node = new AST_Node("optional", index);
        ast.push(node);
        try {
            var n = this[action[1][0]](action[1], symbols, index, phrase_table, node);
            node.size += n.size;
            index += n.size;
        } catch (e) {
            node.pop();
            // currently no error should be problematic
        }
        return node;
    };
    Phrase.prototype.error = function (str, stats) {
        error(this, str, stats);
    };
    gp.Phrase = Phrase;


    function AST_Node(type, index, id, nodes) {
        this.type = type||"node";
        if (typeof id === "string") {this.id = id;}
        this.index = index||0;
        this.size = 0;
        this.nodes = nodes||[];
        for (var i=0;i<this.nodes.length;i++) {
            this.size += this.nodes[i].size;
        }
    }
    AST_Node.prototype.push = function (node) {
        this.nodes.push(node);
        this.size += node.size;
    };
    AST_Node.prototype.pop = function (node) {
        var n = this.nodes.pop();
        this.size -= n.size;
    };
    AST_Node.prototype.remove = function (index) {
        var n = this.nodes.splice(index, 1);
        this.size -= n.size;
    };
    AST_Node.prototype.get = function (index) {
        return this.nodes[index];
    };
    AST_Node.prototype.last = function () {
        return this.nodes[this.nodes.length-1];
    };
    AST_Node.prototype.length = function () {
        return this.nodes.length;
    };


    function create(symbol_list, phrase_list, print_rules) {
        var parser = {
            "name": name,
            "symbol_table": {},
            "symbol_list": [],
            "add_symbol": function (s) {
                if (!(s instanceof Symbol)) {
                    s = new Symbol(s);
                }
                if (typeof this.symbol_table[s.id] == "undefined") {
                    this.symbol_table[s.id] = s;
                    this.symbol_list.push(s);
                } else {
                    for (var i=0;i<s.exp.length;i++) {
                        this.symbol_table[s.id].exp.push(s.exp[i]);
                    }
                }
            },
            "remove_symbol": function (id) {
                var index = this.symbol_list.indexOf(this.symbol_table[id]);
                if (index != -1) {
                    this.symbol_list.splice(index, 1);
                    delete this.symbol_table[id];
                }
            },
            "phrase_table": {},
            "add_phrase": function (p) {
                if (!(p instanceof Phrase)) {
                    p = new Phrase(p);
                }
                if (typeof this.phrase_table[p.id] == "undefined") {
                    this.phrase_table[p.id] = p;
                } else {
                    throw "Cannot add phrase, duplicate id";
                }
            },
            "remove_phrase": function (id) {
                delete this.phrase_table[id];
            },
            "pretty_print_list": [],
            "pretty_print_table": {},
            "add_pretty_print_rule": function (rule) {
                if (typeof rule == "object") {
                    if (typeof rule.id == "string") {
                        this.pretty_print_table[rule.id] = rule;
                        this.pretty_print_list.push(rule);
                    } else {
                        error(null, "Pretty Print Error: Cannot add pretty print rule without a valid id", {"rule": rule});
                    }
                } else {
                    error(null, "Pretty Print Error: Cannot add type \"" + (typeof rule) + "\" as pretty print rule", {"rule": rule});
                }
            },
            "remove_pretty_print_rule": function (id) {
                var index = this.pretty_print_list.indexOf(this.pretty_print_table[id]);
                if (index != -1) {
                    this.pretty_print_list.splice(index, 1);
                    delete this.pretty_print_table[id];
                }
            },
            "get_pretty_print_rules": function (selector) {
                var options = ["ignore", "indent", "newline", "pad-left", "pad-right"];
                var rules = {
                    "prettify": function(str, indent, html, type, phrase, symbol) {
                        if (this.ignore) {
                            return "";
                        }
                        if (this["pad-left"]) {
                            str = this["pad-left"] + str;
                        }
                        if (this["pad-right"]) {
                            str += this["pad-right"];
                        }
                        if (this.newline) {
                            str = "\n" + indent + str;
                        }
                        if (html) {
                            var classes = [];
                            if (typeof type == "string") {
                                classes.push("node-" + type);
                            }
                            if (typeof phrase == "string") {
                                classes.push("phrase-" + phrase);
                            }
                            if (typeof symbol == "string") {
                                classes.push("symbol-" + symbol);
                            }
                            str = '<span class="' + classes.join(" ") + '">' + str + '</span>';
                        }
                        return str;
                    }
                };
                if (typeof selector == "string") {
                    for(var i=0;i<this.pretty_print_list.length;i++) {
                        var rule = this.pretty_print_list[i];
                        var reg = new RegExp(rule.id + "$");
                        if (reg.test(selector)) { // if this rule matches the last part of the call stack
                            for (var j=0;j<options.length;j++) {
                                if (typeof rule[options[j]] != "undefined") {
                                    rules[options[j]] = rule[options[j]];
                                }
                            }
                        }
                    }
                }
                return rules;
            },
            "lex": lex,
            "parse": parse,
            "print_ast": print_ast,
            "pretty_print": pretty_print,
        };

        // check symbol_table
        if (Array.isArray(symbol_list)) {
            map(symbol_list, function (s, i) {
                parser.add_symbol(new Symbol(s.id, s.exp));
            });
        } else {
            error(null, "Symbol list argument needs to be an array!", {"symbol_list": symbol_list});
        }

        // check and process parser_nodes
        if (Array.isArray(phrase_list)) {
            map(phrase_list, function (p, i) {
                parser.add_phrase(new Phrase(p.id, p.parse));
            });
        } else {
            error(null, "Parser node definitions needs to be an array!", {"phrase_list": phrase_list});
        }

        // check and process print_rules
        if (print_rules) {
            map(print_rules, function (p) {
                parser.add_pretty_print_rule(p);
            });
        }

        return parser;
    }
    gp.create = create;

    function lex(str) {
        var symbols = [];
        var sl = this.symbol_list;
        while(str.length > 0) {
            var found = false;
            for (var i=0;i<sl.length;i++) {
                var match = sl[i].match(str);
                if (match) {
                    found = true;
                    str = str.substr(match.length);
                    symbols.push(match);
                    i = sl.length;
                }
            }
            if (!found) {
                error(
                    null, "Lex Error: no matching symbol found for \"" + str.substr(0, 5) + "\"",
                    {"matched_symbols": symbols, "string": str, "symbol_list": sl}
                );
            }
        }
        return symbols;
    }

    function parse(str, compress) {
        compress = typeof compress == "boolean"?compress:true;
        var symbols;
        if (typeof str === "string") {
            symbols = this.lex(str);
        } else if (Array.isArray(str)) {
            symbols = str;
        } else {
            error(null, "Parse Error: Expected Array or String, got type \"" + (typeof str) + "\"", {"str": str});
        }
        var program = this.phrase_table["program"];
        if (typeof program == "undefined") {
            error(
                null, "Parse Error: Phrase \"Program\" not found. A \"Program\" Phrase is needed for the parser to start parsing",
                {"phrase_table": this.phrase_table}
            );
        }
        var ast = new AST_Node(program.id, 0, []);
        if (symbols.length > 0) {
            try {
                var p = program.ast(symbols, 0, this.phrase_table, ast);
                ast.size += p.size;
            } catch (e) {
                console.log(e);
                console.log("ast", ast, {"stringified": JSON.stringify(ast)});
                throw e;
            }
        }
        if (compress) {
            ast = compress_ast(ast);
        }
        return ast;
    }

    // prints the original text from the AST
    function print_ast(ast, html) {
        var str = "";
        if (ast.type != "symbols") {
            for (var i=0;i<ast.nodes.length;i++) {
                str += print_ast(ast.nodes[i], html);
            }
            if (html) {
                return '<span class="node-' + ast.type + ((typeof ast.id != "undefined")?" phrase-" + ast.id:"") + '">' + str + "</span>";
            } else {
                return str;
            }
        } else {
            for (var i=0;i<ast.nodes.length;i++) {
                var s = ast.nodes[i].text;
                if (html) {
                    str += '<span class="symbol-' + ast.nodes[i].id + '">' + s + '</span>';
                } else {
                    str += s;
                }
            }
            if (html) {
                return '<span class="node-symbols">' + str + '</span>';
            } else {
                return str;
            }
        }
    }

    function compress_ast(ast) {
        if (ast.type != "symbols") {
            if (ast.nodes[0] && ast.nodes[0].type == "ast") {
                ast.id = ast.nodes[0].id;
            }
            for (var i=0;i<ast.nodes.length;i++) {
                var ret = compress_ast(ast.nodes[i]);
                if (Array.isArray(ret)) {
                    ast.nodes.splice(i, 1);
                    var size = ret.length;
                    while (ret.length > 0) {
                        ast.nodes.splice(i, 0, ret.pop());
                    }
                    i += size - 1;
                }
            }
        }
        switch (ast.type) {
            case "phrases":
            case "program":
            case "symbols":
                return ast;

            case "ast":
            case "and":
            case "or":
            case "xor":
            case "zero_or_more":
            case "one_or_more":
            case "optional":
                return ast.nodes;
        }
        error(ast, "Compressor Error: encountered unknown AST type!");
    }

    // ignore, indent, newline, pad-left, pad-right
    function pretty_print(str, html, indent, cs) {
        indent = indent||"";
        var ast;
        var rules;
        if (typeof str === "string") {
            ast = this.parse(str);
        } else if (typeof str === "object") {
            ast = str;
        } else {
            error(null, "Pretty Print Error: Expected Object or String, got type \"" + (typeof str) + "\"", {"str": str});
        }
        str = "";

        if (ast.id) {
            cs = (cs?cs + " ":"") + "#" + ast.id;
            rules = this.get_pretty_print_rules(cs);
        } else {
            rules = this.get_pretty_print_rules();
        }
        indent += rules.indent||"";
        for (var i=0;i<ast.nodes.length;i++) {
            var a = ast.nodes[i];
            if (ast.type != "symbols") {
                str += this.pretty_print(a, html, indent, cs);
            } else {
                var r = this.get_pretty_print_rules(cs + " ." + a.id);
                str += r.prettify(a.text, indent + (r.indent||""), html, null, null, a.id);
            }
        }
        return rules.prettify(str, indent, html, ast.type, ast.id, null);
    }

    return gp;
})();
