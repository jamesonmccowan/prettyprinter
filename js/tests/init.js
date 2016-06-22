function random_string() {
    var ch = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    var length = Math.floor((Math.random()*5)+5);
    var str = "";
    for (var i=0;i<length;i++) {
        str += ch.charAt(Math.floor(Math.random()*ch.length));
    }
    return str;
}

describe("A test of the test framework", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});
describe("General Parser", function() {
    it("Exists", function() {
        expect(typeof GP === "object").toBe(true);
    });
    var ef = ["Phrase", "Symbol", "create", "each", "map"];
    for (var i=0;i<ef.length;i++) {
        it("Has a \"" + ef[i] + "\" function", (function(key) {
            return function () {
                expect(typeof GP[key] === "function").toBe(true);
            };
        })(ef[i]));
    }
    it("And has no other fields", function() {
        for (var key in GP) {
            if (GP.hasOwnProperty(key)) {
                expect(ef.indexOf(key) > -1).toBe(true);
            }
        };
    });
});
