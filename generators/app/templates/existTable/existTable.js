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

/******* Start of generated part using tables */
    const entities = [ <% tables.forEach((table,idx,array) => { %>"<%= table.name %>"<% if (idx !== array.length - 1) { %>,<% } %><% }); %> ]
/******* End of generated part using tables */

async function transac(){
    let count = 0
    sqlParams.sql = 'SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES where table_schema=\'public\';'
    await rdsDataService.executeStatement(sqlParams).promise().then(x => {
        count = x.records[0][0].longValue
    })

    return count==entities.length


}


module.exports.existTable = () => {
    return transac()

}



