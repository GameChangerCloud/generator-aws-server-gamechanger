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
let tweetTab = []
function initTweet(){
	for(let i = 0; i < 5; i++){
		tweetTab.push(new model.Tweet(pad(faker.random.number(), 3), faker.lorem.word(), getRandomDateTime().toISOString(), null, null));
	}
}

function updateTweet(tweet){
if(tweet.user_id == null) {
let _position = pickOne(userTab);
let tweetUserBis = userTab[_position];
tweet = update(tweet, "user", tweetUserBis.id, new model.Tweet);
}
if(tweet.stat_id == null) {
let _position = pickOne(statTab);
let tweetStatBis = statTab[_position];
tweet = update(tweet, "stat", tweetStatBis.id, new model.Tweet);
}
return tweet;}

let datetimeTab = []
function initDateTime(){
	for(let i = 0; i < 5; i++){
		datetimeTab.push(new model.DateTime());
	}
}

function updateDateTime(datetime){
return datetime;}

let userTab = []
function initUser(){
	for(let i = 0; i < 5; i++){
		userTab.push(new model.User(pad(faker.random.number(), 3), faker.internet.userName(), faker.name.firstName(), faker.name.lastName(), faker.name.firstName(), faker.name.firstName()));
	}
}

function updateUser(user){
return user;}

let statTab = []
function initStat(){
	for(let i = 0; i < 5; i++){
		statTab.push(new model.Stat(pad(faker.random.number(), 3), faker.random.number(), faker.random.number(), faker.random.number(), faker.random.number()));
	}
}

function updateStat(stat){
return stat;}

let notificationTab = []
function initNotification(){
	for(let i = 0; i < 5; i++){
		notificationTab.push(new model.Notification(pad(faker.random.number(), 3), faker.lorem.word()));
	}
}

function updateNotification(notification){
return notification;}

let metaTab = []
function initMeta(){
	for(let i = 0; i < 5; i++){
		metaTab.push(new model.Meta(pad(faker.random.number(), 3), faker.random.number()));
	}
}

function updateMeta(meta){
return meta;}


/*******
 * End of generated part using listOfMethodsForInit
 */

/*******
 * Start of generated part using initEachModelsJS
 */
initTweet()
initUser()
initStat()
initNotification()
initMeta()

/*******
 * End of generated part using initEachModelsJS
 */

 /*******
 * Start of generated part using initEachFieldsModelsJS
 */
for(let i = 0; i < tweetTab.length; i++){
	tweetTab[i] = updateTweet(tweetTab[i]);
}for(let i = 0; i < datetimeTab.length; i++){
	datetimeTab[i] = updateDateTime(datetimeTab[i]);
}for(let i = 0; i < userTab.length; i++){
	userTab[i] = updateUser(userTab[i]);
}for(let i = 0; i < statTab.length; i++){
	statTab[i] = updateStat(statTab[i]);
}for(let i = 0; i < notificationTab.length; i++){
	notificationTab[i] = updateNotification(notificationTab[i]);
}for(let i = 0; i < metaTab.length; i++){
	metaTab[i] = updateMeta(metaTab[i]);
}


/*******
 * End of generated part using initEachFieldsModelsJS
 */

const queriesInsert = []

 /*******
 * Start of generated part using initQueriesInsert
 */
tweetTab.forEach(item => {
	let temp = `INSERT INTO "Tweet"("Pk_Tweet_id", "body", "date", "Fk_User_id", "Fk_Stat_id") VALUES (`+item.id+`, '`+item.body+`', '`+item.date+`', `+item.user+`, `+item.stat+`)`
	queriesInsert.push(temp)
})
userTab.forEach(item => {
	let temp = `INSERT INTO "User"("Pk_User_id", "username", "firstname", "lastname", "fullname", "name") VALUES (`+item.id+`, '`+item.username+`', '`+item.firstname+`', '`+item.lastname+`', '`+item.fullname+`', '`+item.name+`')`
	queriesInsert.push(temp)
})
statTab.forEach(item => {
	let temp = `INSERT INTO "Stat"("Pk_Stat_id", "views", "likes", "retweets", "responses") VALUES (`+item.id+`, `+item.views+`, `+item.likes+`, `+item.retweets+`, `+item.responses+`)`
	queriesInsert.push(temp)
})
notificationTab.forEach(item => {
	let temp = `INSERT INTO "Notification"("Pk_Notification_id", "type") VALUES (`+item.id+`, '`+item.type+`')`
	queriesInsert.push(temp)
})
metaTab.forEach(item => {
	let temp = `INSERT INTO "Meta"("Pk_Meta_id", "count") VALUES (`+item.id+`, `+item.count+`)`
	queriesInsert.push(temp)
})

 /*******
 * Start of generated part using initQueriesInsert
 */
    transac(queriesInsert).then(r => console.log("Done: " +r));





}
