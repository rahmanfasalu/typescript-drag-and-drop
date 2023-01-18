function Logger(logString:string){
    return function (constructor:Function){
        console.log(logString);
        console.log("constructor",constructor);
    };
   
}
function Logg(target:any,propertyName:string | Symbol){
    console.log("property decorator");
    console.log(target,propertyName);
};

@Logger("Loggin Person")
class Person {
    @Logg
    name = 'fasalu'
    constructor(){
        console.log("Person class...");
        console.log(this.name);
    }
}


const pers = new Person();
console.log(pers)