const rdsdata = require("rds-data");

let beginTransactionParams = {
        secretArn: process.env.SECRETARN,
        resourceArn: process.env.RESOURCEARN,
        database: process.env.DATABASE,
    }

    <%-deleteTables%>

    <%-createTables%>

    <%-addConstraints%>

    <%-deleteColumns%>

    <%-addColumns%>

    <%-updateColumns%>

    async function transac(){
        const db = new rdsdata.RDSDatabase(beginTransactionParams).getInstance();
        let hasFailed = false
        await db.transaction().then(async (transactionId) => {
            for(let i = 0; i < queriesDrop.length; i++){
                if(!hasFailed) {
                    await db.query(queriesDrop[i].text, queriesDrop[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            for(let i = 0; i < queriesAdd.length; i++){
                if(!hasFailed) {
                    await db.query(queriesAdd[i].text, queriesAdd[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            for(let i = 0; i < queriesAddFields.length; i++){
                if(!hasFailed) {
                    await db.query(queriesAddFields[i].text, queriesAddFields[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            for(let i = 0; i < queriesConstraint.length; i++){
                if(!hasFailed) {
                    await db.query(queriesConstraint[i].text, queriesConstraint[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            for(let i = 0; i < queriesDeleteFields.length; i++){
                if(!hasFailed) {
                    await db.query(queriesDeleteFields[i].text, queriesDeleteFields[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            for(let i = 0; i < queriesUpdateFields.length; i++){
                if(!hasFailed) {
                    await db.query(queriesUpdateFields[i].text, queriesUpdateFields[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }

            if(!hasFailed) {
                await db.commit(transactionId).then(r => {console.log("commit"); return "Tables added"});
            }
            else {
                console.log("Transaction rolled back")
                return "Error, tables not added"
            }
        });

    }


module.exports.updateDatabase = () => {

    transac().then(r => console.log("Done :" + r));

}



