const rdsdata = require("rds-data");

let beginTransactionParams = {
        secretArn: process.env.SECRETARN,
        resourceArn: process.env.RESOURCEARN,
        database: process.env.DATABASE,
    }

    <%-dropTables%>

    async function transac(){
        const db = new rdsdata.RDSDatabase(beginTransactionParams).getInstance();
        let hasFailed = false
        await db.transaction().then(async (transactionId) => {
            for(let i = 0; i < queriesDrop.length; i++){
                if(!hasFailed) {
                    await db.query(queriesDrop[i].text, queriesDrop[i].tableName, transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
                }
            }
            if(!hasFailed) {
                await db.commit(transactionId).then(r => {console.log("commit"); return "Tables dropped"});
            }
            else {
                console.log("Transaction rolled back")
                return "Error, tables not added"
            }
        });

    }


module.exports.dropTables = () => {

    transac().then(r => console.log("Done :" + r));

}



