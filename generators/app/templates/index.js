const { graphql} = require('graphql');

const schema = require ('./graphql/schema')
const initDatabase = require ('./initDatabase/initDatabase')
const fillTable = require ('./initDatabase/fillTables')
const dropTables = require ('./cleanDatabase/dropTables')
const cleanTables = require ('./cleanDatabase/cleanTables')
const existTable = require ('./existTable/existTable')
<%-importUpdate%>

// Entry point of the lambdas function 
module.exports.handler = (event, context, callback) => {

  if(event["query"]) {
    graphql({schema: schema, source: event["query"], variableValues: event["variables"]}).then((response) => {
      console.log(JSON.stringify(response))
      if(response.errors)
        callback(null, {statusCode: 200, data: response.data, errors: response.errors})
      else
        callback(null, {statusCode: 200, data: response.data})
    })
  }

  else if(event["initTable"]) {
    console.log("InitTable")
    initDatabase.initDatabase()
    callback(null, {statusCode: 200, body: JSON.stringify("Init done")})
  }

  else if(event["fillTable"]) {
    console.log("Fill the tables")
    fillTable.fillTables(event["fillTable"])
    callback(null, {statusCode: 200, body: JSON.stringify("Fill done")})
  }

  else if(event["dropTables"]) {
    console.log("Drop all tables")
    dropTables.dropTables()
    callback(null, {statusCode: 200, body: JSON.stringify("Drop done")})
  }

  else if(event["cleanTables"]) {
    console.log("Clean all tables")
    cleanTables.cleanTables()
    callback(null, {statusCode: 200, body: JSON.stringify("Clean done")})
  }

  else if(event["existTable"]) {
    console.log("Tables exists ?")
    existTable.existTable().then(x => callback(null, {statusCode: 200, body: JSON.stringify(x)}))
  }

  <%-updateRequest%>


else {
    console.log("Hello world")
    callback(null, {statusCode: 200, body: JSON.stringify("Unknow command")})
  }
}