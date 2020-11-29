const faker = require('faker');
const model = require('./models');
const rdsdata = require("rds-data");

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function formatTime(date) {
    var d = new Date(date),
        hours = '' + (d.getHours() + 1),
        minutes = '' + d.getMinutes(),
        seconds = '' + d.getSeconds();
    if(hours.length < 2)
        hours = '0' + hours
    if(minutes.length < 2)
        minutes = '0' + minutes
    if(seconds.length < 2)
        seconds = '0' + seconds
    return [hours, minutes, seconds].join(':');
}

function getRandomDateTime(){
    return new Date(+(new Date()) - Math.floor(Math.random()*10000000000));
}

function getRandomDate(){
    return formatDate(getRandomDateTime())
}

function getRandomTime(){
    return formatTime(getRandomDateTime())
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

const beginTransactionParams = {
    secretArn: process.env.SECRETARN,
    resourceArn: process.env.RESOURCEARN,
    database: process.env.DATABASE,
}

async function transac(queriesInsert){
    const db = new rdsdata.RDSDatabase(beginTransactionParams).getInstance();
    let hasFailed = false
    await db.transaction().then(async (transactionId) => {
        for(let i = 0; i < queriesInsert.length; i++){
            if(!hasFailed){
              console.log(queriesInsert[i])
              await db.query(queriesInsert[i], "name", transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
            }
        }
        if(!hasFailed){
          await db.commit(transactionId).then(r => {console.log("commit"); return "Items added"});
        }
        else {
          console.log("Transaction rolled back")
          return "Error, items not added"
        }
    });
}

module.exports.fillTables = (numberItem) => {


/*******
 * Start of generated part using listOfMethodsForInit
 */
<%-listOfMethodsForInit%>
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

const queriesInsert = []

 /*******
 * Start of generated part using initQueriesInsert
 */
<%-initQueriesInsert%>
 /*******
 * Start of generated part using initQueriesInsert
 */
    transac(queriesInsert).then(r => console.log("Done: " +r));





}
