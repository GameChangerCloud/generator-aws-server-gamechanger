// require the AWS SDK
const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService()

const sqlUtils = require('../database/sqlUtils.js');

const databaseConnect = {
  secretArn: process.env.SECRETARN,
  resourceArn: process.env.RESOURCEARN,
  database: process.env.DATABASE,
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

const addPostGisSupport = async () => {
  let selectParams = {
    secretArn: databaseConnect.secretArn,
    resourceArn: databaseConnect.resourceArn,
    sql: "SELECT * FROM pg_extension where extname LIKE '%postgis%'",
    database: databaseConnect.database
  }
  console.log("Executing SQL Query "+selectParams.sql);
  let dbResponse = await rdsDataService.executeStatement(selectParams).promise();
  if (dbResponse.records.length == 0) {
    console.log("Creating geographic extensions");
    for(let i = 0; i < postgisExt.length; i++){
      let createExtensionsParams = {
        secretArn: databaseConnect.secretArn,
        resourceArn: databaseConnect.resourceArn,
        sql: "CREATE EXTENSION "+postgisExt[i],
        database: databaseConnect.database
      } 
      await rdsDataService.executeStatement(createExtensionsParams).promise();
    }
  }else {
    console.log("Geographic extensions already there");
  }
}

const graphQLTables = async () => {
  console.log("Creating GraphQL schema tables");

  for(let i = 0; i < queriesAdd.length; i++){
    let createTableParams = {
      secretArn: databaseConnect.secretArn,
      resourceArn: databaseConnect.resourceArn,
      sql: queriesAdd[i],
      database: databaseConnect.database
    }
    console.log("Executing SQL command "+createTableParams.sql);
    await rdsDataService.executeStatement(createTableParams).promise();
  }
  for(let i = 0; i < queriesConstraint.length; i++){
    let createTableParams = {
      secretArn: databaseConnect.secretArn,
      resourceArn: databaseConnect.resourceArn,
      sql: queriesConstraint[i].text,
      database: databaseConnect.database
    }
    console.log("Executing SQL command "+createTableParams.sql);
    await rdsDataService.executeStatement(createTableParams).promise();
  }
  return "All OK";
}

module.exports.initDatabase = async () => {
  try {
    await addPostGisSupport();
    await graphQLTables();
    //await addConstraints();
  }
  catch(e) {
    return "Init failed";
  }
  return "Init done !"

}
