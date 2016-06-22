describe("The \"map\" function", function() {
    it("Can iterate over an Array", function() {
        var size = Math.floor((Math.random()*15)+5);
        var a = [];
        for (var i=0;i<size;i++) {
            a.push(Math.floor((Math.random()*200)-100));
        }
        var b = [];
        var c = GP.map(a, function (val, key) {
            b.push(key);
            return val;
        });

        expect(size == a.length).toBe(true);
        expect(a.length == b.length).toBe(true);
        expect(b.length == c.length).toBe(true);
        expect(c.length == a.length).toBe(true);
        expect(a).toEqual(c);
        
        for (var i=0;i<size;i++) {
            expect(b[i]).toBe(i);
        }
    });
    it("Can iterate over an Object", function() {
        var size = Math.floor((Math.random()*15)+5);
        var a = {};
        for (var i=0;i<size;i++) {
            a[random_string()] = i;
        }
        var b = [];
        var c = GP.map(a, function (val, key) {
            b.push(key);
            return val;
        });
        expect(size == b.length).toBe(true);
        expect(a).toEqual(c);
    });
    it("Can handle empty Array", function() {
        var a = [];
        GP.map(a, function (val, key) {
            fail("Should not have anything to iterate over");
        });
        expect(a).toEqual([]);
    });
    it("Can handle empty Object", function() {
        var a = {};
        GP.map(a, function (val, key) {
            fail("Should not have anything to iterate over");
        });
        expect(a).toEqual({});
    });
    it("Can handle string", function() {
        var str = "test";
        var s = GP.map(str, function (val, key) {
            return val;
        });
        expect(str).toEqual(s);
    });
});
