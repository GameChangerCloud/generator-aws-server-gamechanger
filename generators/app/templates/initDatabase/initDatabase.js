// require the AWS SDK
const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService()

const sqlUtils = require('../database/sqlUtils.js');

const utils = require('../database/utils/index')


let sqlParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	sql: "",
	database: process.env.DATABASE,
	includeResultMetadata: true,
	parameters: []
}
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

// for postgis
let selectParams = {
  secretArn: process.env.SECRETARN,
  resourceArn: process.env.RESOURCEARN,
  sql: "SELECT * FROM pg_extension where extname LIKE '%postgis%'",
  database: process.env.DATABASE
}

const postgisExt = [ "postgis", "fuzzystrmatch", "postgis_tiger_geocoder", "postgis_topology" ];

let queriesAdd = sqlUtils.getSQLCreateTables();

/*******
 * Start of generated part using addConstraints
 */
<%- include('../database/partials/queriesConstraint.ejs', {tables: tables}) %>
/*******
 * End of generated part using addConstraints
 */



module.exports.initDatabase = async () => {
  try {
    
    let sqlRequests = []

    
    console.log("Executing SQL Query "+selectParams.sql);
    let dbResponse = await rdsDataService.executeStatement(selectParams).promise();
    if (dbResponse.records.length == 0) {
      for(let i = 0; i < postgisExt.length; i++){
        sqlRequests.push("CREATE EXTENSION "+postgisExt[i])
      }
    }else {
      console.log("Geographic extensions already there");
    }

    
    for(let i = 0; i < queriesAdd.length; i++){
      sqlRequests.push(queriesAdd[i])
    }
    for(let i = 0; i < queriesConstraint.length; i++){
      sqlRequests.push(queriesConstraint[i].text)
    }
    utils.startSqlTransaction(sqlRequests, beginParams, commitParams, sqlParams, rdsDataService)


  }
  catch(e) {
    return "Init failed";
  }
  return "Init done !"

}
