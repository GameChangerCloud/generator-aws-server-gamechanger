const rdsdata = require("rds-data");
const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()

let sqlParams = {
    secretArn: process.env.SECRETARN,
    resourceArn: process.env.RESOURCEARN,
    sql: "",
    database: process.env.DATABASE,
    includeResultMetadata: true,
    parameters: []
}
let beginTransactionParams = {
    secretArn: process.env.SECRETARN,
    resourceArn: process.env.RESOURCEARN,
    database: process.env.DATABASE,
}

    <%-cleanTables%>

async function transac(){
    const db = new rdsdata.RDSDatabase(beginTransactionParams).getInstance();
    let hasFailed = false
    await db.transaction().then(async (transactionId) => {
        sqlParams.sql = 'TRUNCATE TABLE ' + tables + ' CASCADE;'
        await rdsDataService.executeStatement(sqlParams).promise().then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
        if(!hasFailed) {
            await db.commit(transactionId).then(r => {console.log("commit"); return "Tables dropped"});
        }
        else {
            console.log("Transaction rolled back")
            return "Error, tables not added"
        }
    });

}


module.exports.cleanTables = () => {

    transac().then(r => console.log("Done :" + r));

}



