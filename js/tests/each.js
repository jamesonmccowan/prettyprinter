describe("The \"each\" function", function() {
    it("Can iterate over an Array", function() {
        var size = Math.floor((Math.random()*15)+5);
        var a = [];
        for (var i=0;i<size;i++) {
            a.push(Math.floor((Math.random()*200)-100));
        }
        var b = [];
        var c = [];
        GP.each(a, function (val, key) {
            b.push(val);
            c.push(val + key);
            return val + key;
        });

        expect(size == a.length).toBe(true);
        expect(a).toEqual(c);
        for (var i=0;i<size;i++) {
            expect(a[i]).toBe(b[i]+i);
        }
    });
    it("Can iterate over an Object", function() {
        var size = Math.floor((Math.random()*15)+5);
        var a = {};
        for (var i=0;i<size;i++) {
            a[random_string()] = i;
        }
        var b = [];
        var c = [];
        GP.each(a, function (val, key) {
            b.push(key);
            c[key] = val;
            return val + key;
        });
        expect(size == b.length).toBe(true);
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                expect(a[key]).toBe(c[key]+key);
            }
        }
    });
    it("Can handle empty Array", function() {
        var a = [];
        GP.each(a, function (val, key) {
            fail("Should not have anything to iterate over");
        });
        expect(a).toEqual([]);
    });
    it("Can handle empty Object", function() {
        var a = {};
        GP.each(a, function (val, key) {
            fail("Should not have anything to iterate over");
        });
        expect(a).toEqual({});
    });
    it("Can handle string", function() {
        var str = "test";
        var s;
        GP.each(str, function (val, key) {
            s = val;
        });
        expect(str).toEqual(s);
    });
    it("Can iterate over an Object without changing the Object", function() {
        var size = Math.floor((Math.random()*15)+5);
        var a = {};
        for (var i=0;i<size;i++) {
            a[random_string()] = i;
        }
        var b = [];
        var c = [];
        GP.each(a, function (val, key) {
            b.push(key);
            c[key] = val;
        });
        expect(size == b.length).toBe(true);
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                expect(a[key]).toBe(c[key]);
            }
        }
    });
});
