const faker = require('faker');
const model = require('./models');

const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../database/utils/index')


const directivesOnTypes = require('../directives/directivesOnTypes')
const directiveResolver = require('../database/utils/runtimeDirectiveResolver');



let beginParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	database: process.env.DATABASE
}

let commitParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	transactionId: ""
}

let sqlParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	sql: "",
	database: process.env.DATABASE,
	includeResultMetadata: true,
	parameters: []
}

function getRandomDateTime(){
    return new Date(+(new Date()) - Math.floor(Math.random()*10000000000));
}

function getRandomDate(){
    return utils.formatDate(getRandomDateTime())
}

function getRandomTime(){
    return utils.formatTime(getRandomDateTime())
}

function generateRandomListID(){
    let tmp = []
    let size = Math.floor((Math.random() * 10));
    for(let i = 0; i < size; i++){
        tmp.push(pad(faker.random.number(), 3))
    }
    return tmp;
}

function generateRandomListInt(){
    let tmp = []
    let size = Math.floor((Math.random() * 10));
    for(let i = 0; i < size; i++){
        tmp.push(faker.random.number())
    }
    return tmp;
}

function generateRandomListBoolean(){
    let tmp = []
    let size = Math.floor((Math.random() * 10));
    for(let i = 0; i < size; i++){
        tmp.push(faker.random.boolean())
    }
    return tmp;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function getFields(obj){
    let fields = [];
    for(let field in obj){
        fields.push(field);
    }
    return fields;
}

function pickOne(tab){
    let position = Math.floor((Math.random() * tab.length));
    return position;
}

function isUnique(element, tab) {
    let answers = true
    tab.forEach(item => {
        if(element.id === item.id){
            answers = false
        }
    })
    return answers
}

function update(modelToUpdate, field, value, result) {
    let data = {}
    for (let f in modelToUpdate) {
        if (f === field) {
            data[f] = value
        } else {
            data[f] = modelToUpdate[f]
        }
    }
    return Object.assign(result, data);
}


module.exports.fillTables = async (numberItem) => {

const queriesInsert = []
const restoreConstraints = new Set()
const removeConstraints = new Set()
// Stores Relation
const entityIndex = []

/*******
 * Start of generated part using listOfMethodsForInit
 */
<%- include('../database/partials/listOfMethodsForInit.ejs', { typesName: typesName, types: types, relations: relations , matching: matching, tables: tables, hasFieldType: hasFieldType, getSQLTableName: utils.getSQLTableName}) _%>

/*******
 * End of generated part using listOfMethodsForInit
 */

/*******
 * Start of generated part using initEachModelsJS
 */
<%-initEachModelsJS%>
/*******
 * End of generated part using initEachModelsJS
 */

 /*******
 * Start of generated part using initEachFieldsModelsJS
 */
<%-initEachFieldsModelsJS%>
/*******
 * End of generated part using initEachFieldsModelsJS
 */
 queriesInsert.push(...removeConstraints)

 /*******
 * Start of generated part using initQueriesInsert
 */
<%- include('../database/partials/getInitQueriesInsert.ejs', { typesName: typesName, types: types, relations: relations , matching: matching, tables: tables, hasFieldType: hasFieldType, getSQLTableName: utils.getSQLTableName}) _%>
 /*******
 * End of generated part using initQueriesInsert
 */
queriesInsert.push(...restoreConstraints)

for (let index = 0; index < queriesInsert.length ; index ++){
    console.log(queriesInsert[index])
    sqlParams.sql = queriesInsert[index]
    const res = await rdsDataService.executeStatement(sqlParams).promise()
    console.log(JSON.stringify(res.records))
}   

}
