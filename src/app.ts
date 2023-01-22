

// Validatable
function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

enum ProjectType{
  Active,
  Finished
}

class Project {
  constructor(public id: string,public title:string,public description:string, public people:number,public type:ProjectType){
    // 
  }
}

// listners
type Listners<T> = (items:T[])=>void;

class State <T>{
  protected listners: Listners<T>[] = [];

  addListener(listenerFn:Listners<T>){
      this.listners.push(listenerFn);
  };
}
class ProjectState extends State<Project>{
  private projects:Project[] = [];
  private static instance: ProjectState;
  private constructor(){
    super();
  }

  // getInstance 
  static getInstance(){
    if(this.instance){
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  // add listner

  // add project
  addProject({title,description,people}:Partial<Project>){
    // project
    const newProject = new Project(
      Math.random().toString(),
      title || '',
      description || '',
      people || 0,
      ProjectType.Active
    )

    // add new project
    this.projects.push(newProject);

    for(const listnerFn of this.listners){
      listnerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation interface
interface Validatable {
  value:string | number;
  required?:boolean;
  maxLength?:number;
  minLength?:number;
  max?:number;
  min?:number;
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


abstract class ProjectBase<T extends HTMLElement, U extends HTMLElement> {
  templateElement:HTMLTemplateElement;
  hostElement:T;
  element:U;

  constructor(templateID:string,hostID:string,insterAtStart:boolean,newElemId?:string){
    this.templateElement = document.getElementById(templateID)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostID)! as T;
    const importedNode = document.importNode(this.templateElement.content,true);
    this.element = importedNode.firstElementChild as U;
    if(newElemId){
      this.element.id = newElemId;
    }

     this.attach(insterAtStart);
  }

  private attach(insterAtStart:boolean){
    this.hostElement.insertAdjacentElement(insterAtStart ? "beforeend" : "afterbegin",this.element);
  }

  abstract renderContent():void;
  abstract configure():void;

};


class ProjectItem extends ProjectBase<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {}

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

class ProjectList extends ProjectBase<HTMLDivElement,HTMLUListElement> {
  assignedProjects:Project[];
  constructor(private type:ProjectType){
    super("project-list","app",true,`${type}-projects`);
    this.assignedProjects = [];

    projectState.addListener((projects:Project[])=>{
       const relevantProjects = projects.filter(prj => {
        if (this.type === ProjectType.Active) {
          return prj.type === ProjectType.Active;
        }
        return prj.type === ProjectType.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.renderContent();
  }

  configure(){}

  private renderProjects(){
    // render this.assignedProjects;
    const listId = `${this.type}-projects-list`;
    const ul = document.getElementById(listId) as HTMLUListElement;
    ul.innerHTML = '';
    for(const item of this.assignedProjects){
      new ProjectItem(this.element.querySelector('ul')!.id, item);
    }
  };
 
  renderContent(){
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("h2")!.textContent = `${this.type}`.toUpperCase() + ' ' + "PROJECTS";
    this.element.querySelector("ul")!.id = listId;
  }
  // private attach(){
  //   this.hostElement.insertAdjacentElement('beforeend',this.element);
  // }
};


class ProjectInput extends ProjectBase<HTMLDivElement,HTMLFormElement>  {
  
  titleInputElement:HTMLInputElement;
  descriptionInputElement:HTMLInputElement;
  peopleInputElement:HTMLInputElement;
  
  constructor(){
    super("project-input","app",false,"user-input");
    this.titleInputElement =  this.element.querySelector("#title")! as HTMLInputElement;
    this.descriptionInputElement  = this.element.querySelector("#description")! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;
    this.configure();
  }
  
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };
  
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }
  
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if(Array.isArray(userInput)){
      const [title, description, people] = userInput;
      projectState.addProject({title, description, people});
      this.clearInputs();
    }
  }

  // render content
  renderContent(){

  }
  // configure
  configure(){
    this.element.addEventListener('submit',this.submitHandler)
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
  
}

// new project
const project = new ProjectInput();

//
const activeProjects = new ProjectList(ProjectType.Active);
const finishedProjects = new ProjectList(ProjectType.Finished);