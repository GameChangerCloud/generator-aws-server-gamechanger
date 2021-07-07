const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../database/utils/index')

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
/******* Start of generated part using tables */
    const tables = '<% tables.forEach((table,idx,array) => { %>"<%= table.sqlname %>"<% if (idx !== array.length - 1) { %>,<% } %><% }); %>'
/******* End of generated part using tables   */
const sqlRequests = []
sqlRequests.push('TRUNCATE TABLE ' + tables + ' CASCADE;')

module.exports.cleanTables = () => {

    utils.startSqlTransaction(sqlRequests, beginParams, commitParams, sqlParams, rdsDataService)

}



