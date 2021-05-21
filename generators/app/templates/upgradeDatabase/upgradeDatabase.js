const rdsdata = require("rds-data");

const sqlUtils = require('../database/sqlUtils.js');

let beginTransactionParams = {
        secretArn: process.env.SECRETARN,
        resourceArn: process.env.RESOURCEARN,
        database: process.env.DATABASE,
    }

/******* Start of generated part using tables */
    const tables = '<% tables.forEach((table,idx,array) => { %>"<%= table.name %>"<% if (idx !== array.length - 1) { %>,<% } %><% }); %>'
/******* End of generated part using tables   */

    let queriesAdd = sqlUtils.getSQLCreateTables();
    let sqlTables = sqlUtils.getSQLTables();

    //<# addConstraints %>
    <%- include('../database/partials/queriesConstraint.ejs', {tables: tables}) %>
    //<# deleteColumns %>
    <%- include('../database/partials/queriesDeleteFields', {fields: delete_fields}) %>
    //<# addColumns %>
    <%- include('../database/partials/queriesAddFields.ejs', {fields: add_fields}) %>
    // <# updateColumns %>
    <%- include('../database/partials/queriesUpdateFields.ejs', {fields: update_fields}) %>

    async function transac(){
        const db = new rdsdata.RDSDatabase(beginTransactionParams).getInstance();
        let hasFailed = false
        await db.transaction().then(async (transactionId) => {
            // First drop all tables
            await db.query('DROP TABLE IF EXISTS ' + sqlTables[i] + ' CASCADE', sqlTables[i], transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})

            for(let i = 0; i < queriesAdd.length; i++){
                if(!hasFailed) {
                    await db.query(queriesAdd[i], sqlTables[i], transactionId).then(r => console.log(r)).catch(err => {console.log(err); hasFailed = true})
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



