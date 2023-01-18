
// validation interface
interface Validatable {
  value:string | number;
  required?:boolean;
  maxLength?:number;
  minLength?:number;
  max?:number;
  min?:number;
}

// validate
function validate(validatableInput:Validatable){
  let isValid = true;
  if(validatableInput.required){
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if(validatableInput.maxLength && typeof validatableInput.value === 'string'){
     isValid = isValid && validatableInput.value.length > validatableInput.maxLength;
  }
  if(validatableInput.minLength && typeof validatableInput.value === 'string'){
     isValid = isValid && validatableInput.value.length < validatableInput.minLength;
  }
  return isValid;
}

// auto bind decorator
function autobind(_target:any, _methodName:string,descriptor:PropertyDescriptor){
  const originaMethod = descriptor.value;
  const adjDescriptor:PropertyDescriptor = {
    enumerable:true,
    get(){
      const boundFun =  originaMethod.bind(this);
      return boundFun;
    }
  }
  return adjDescriptor
}

class ProjectList {
  templateElement:HTMLTemplateElement;
  hostElement:HTMLDivElement;
  element:HTMLElement;

  constructor(private type:'active' | 'finished'){
    this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content,true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${type}-projects`;
    
    this.renderContent();
    this.attach();
  }

  private renderContent(){
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("h2")!.textContent = `${this.type}`.toUpperCase() + ' ' + "PROJECTS";
    this.element.querySelector("ul")!.id = listId;
  }
  private attach(){
    this.hostElement.insertAdjacentElement('beforeend',this.element);
  }
};


class ProjectInput {
  templateElement:HTMLTemplateElement;
  hostElement:HTMLDivElement;
  element:HTMLFormElement;

  titleInputElement:HTMLInputElement;
  descriptionInputElement:HTMLInputElement;
  peopleInputElement:HTMLInputElement;
  
  constructor(){
    this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content,true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement =  this.element.querySelector("#title")! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#description")! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#people")! as HTMLInputElement;

    this.configure();
    this.attach();
  }
  
 
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  // configure
  private configure(){
    this.element.addEventListener('submit',this.submitHandler)
  }

  // attach
  private attach(){
    this.hostElement.insertAdjacentElement('afterbegin',this.element);
  }
  
}

// new project
const project = new ProjectInput();

// 
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");