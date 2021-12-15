import { Relationships } from "../relationships";



export class Field {
    name : string;
    type: string;
    relationType : Relationships;
    relation : boolean;
    in_model: boolean;
    oneToOneInfo : any;
    nonNullArrayValues : boolean;
    noNull : boolean;
    isArray: boolean;
    directives : any;
    args : any;
    delegated_field : any;
    foreign_key : any;
    isDeprecated : boolean;
    joinTable : any;


  public constructor(
    name: string, 
    type: string, 
    nonNullArrayValues: boolean, 
    noNull: boolean, 
    isArray: boolean, 
    directives: any, 
    args: any, 
    isDeprecated: boolean, 
) {
    this.name = name
    this.type = type
    this.nonNullArrayValues = nonNullArrayValues
    this.noNull = noNull
    this.isArray = isArray
    this.directives = directives
    this.args = args
    this.isDeprecated = isDeprecated
  }



  setNoNull(){
    this.noNull = true
  }
  

  /**
 * Set up types fields to handle tracking of foreign key that might have been added by other types 
 * Init Object type parameters . obj = {key1 : value1, key2 : value2 ....}
 * @param {*} types list of types  
 * @returns nothing
 */
  initObjectParameters(){
    this.foreign_key = null;
    // if the field is a relation
    this.relation = false;
    // if the field is added or is adding to another field
    this.delegated_field = {
      "state" : false,
      "side" : null, 
      "associatedWith": {
          "type": null,
          "fieldName" : null
      }
    }
    // if the field will appear in final model (tables) ex for oneToMany relation the field may dissapear

    this.in_model = true;

    // contains info if the field will be in a joinTable in final model, the name of the table
    // the name of the fields associated in the table 
    this.joinTable = {
      "state" : false,
      "name" : null,
      "contains" : []
    }
    //Contains info about OneToOne relations
    this.oneToOneInfo = null

  }  
   
    greet() {
      return "Hello, ";
    }
  }