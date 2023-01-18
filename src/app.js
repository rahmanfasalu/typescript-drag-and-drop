var Person = /** @class */ (function () {
    function Person() {
        this.name = 'fasalu';
        console.log("Person class...");
        console.log(this.name);
    }
    return Person;
}());
var pers = new Person();
console.log(pers);
