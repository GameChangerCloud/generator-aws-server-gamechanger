const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../utils/index')
/******* Start of generated part (except for 'const TABLE = ' ) using typeName */
const TABLE = "<%-sqltypeName%>"
/******* End of generated part using typeName */

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

const resolvers = require('../utils/<%= typeName.toLowerCase() %>DirectiveResolvers')

const directiveResolver = require('../utils/runtimeDirectiveResolver')

const constructSort = (args) => {
	let sorting = "ORDER BY \""

	if(args) {
		// Sort field (default Fk_<%-sqltypeName%>_id)
		if(args.sort_field && args.sort_field !== "id") {
			sorting += args.sort_field +"\" "
		}
		else {
			/******* Start of generated part (except for 'sorting += "Pk_' ) using typeNameId */
			sorting += "Pk_<%-sqltypeNameId%>_id\" "
			/******* End of generated part using typeNameId */
		}

		// Sort order (default ascendant)
		if(args.sort_order === -1) {
			sorting += "DESC"
		}
		else {
			sorting += "ASC"
		}
	}

	// No arguments
	else {
		/******* Start of generated part (except for 'sorting += "Pk_' ) using typeNameId */
		sorting +=  "Pk_<%-sqltypeNameId%>_id\" ASC"
		/******* End of generated part using typeNameId */
	}

	return sorting
}
    
module.exports = {
    
	async getMethodsByArgs (args , directives){

		// Sorting Field
		const sorting = constructSort(args)

		// Pagination
		const limit = args.limit ? "LIMIT "+args.limit : ""
		const offset = args.skip ? "OFFSET "+args.skip : ""

		// From query, simple
		if(args.id) {
			const value = args.id
			sqlParams.parameters.length = 0
			sqlParams.parameters.push({name: 'value', value: {longValue: value}})
			/******* Start of generated part using typeName and typeNameId*/
			sqlParams.sql = 'SELECT * from "<%-sqltypeName%>" WHERE "Pk_<%-sqltypeNameId%>_id" = :value'
			/******* End of generated part using typeName and typeNameId */
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return utils.constructOutputArray(res)[0] // only one row
		}
		
		// Field from a parent type (other than query)
		else if(args.parentId) {
			const value = args.parentId
			let minifiedparentTypeName = utils.getSQLTableName(args.parentTypeName.toString().replace("Type", ""))
			let fieldType = args.fieldType
			let fieldName = args.parentFieldName
			let res 
			let parentId = args.parentId
			sqlParams.parameters.length = 0
			sqlParams.parameters.push({name: 'value', value: {longValue: value}})

			switch(args.relationType) {
				
				// One unique currentType for N parentType
				case "oneToMany":
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "<%-sqltypeName%>"."Fk_'+fieldName+'_'+fieldType+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)

				case "oneOnly":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "Pk_<%-sqltypeNameId%>_id" = (SELECT "Fk_'+fieldName+'_'+fieldType+'_id" FROM "'+minifiedparentTypeName+'" WHERE "Pk_'+minifiedparentTypeName+'_id" = :value)'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// N currentType for one parentType
				case "manyToOne":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "<%-sqltypeName%>"."Fk_'+fieldName+'_'+fieldType+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)
				case "selfJoinOne":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "<%-sqltypeName%>"."Pk_<%-sqltypeName%>_id" = (SELECT "Fk_'+fieldName+'_'+fieldType+'_id" FROM "'+minifiedparentTypeName+'" WHERE "Pk_'+minifiedparentTypeName+'_id" = :value)'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]
				case "selfJoinMany":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" INNER JOIN "'+args.joinTable.name+'" ON "Pk_<%-sqltypeName%>_id" = "'+args.joinTable.name+'"."'+args.joinTable.field1+'_id" INNER JOIN "'+minifiedparentTypeName+'" ON "Pk_'+minifiedparentTypeName+'_id" = "'+args.joinTable.name+'"."'+args.joinTable.field2+'_id" WHERE "Pk_'+minifiedparentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)
					
				case "manyOnly":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "<%-sqltypeName%>"."Fk_'+fieldName+'_'+minifiedparentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)

				// N currentType for N parentType (Junction table)
				case "manyToMany":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" INNER JOIN "'+args.joinTable.name+'" ON "Pk_<%-sqltypeName%>_id" = "'+args.joinTable.name+'"."'+args.joinTable.field1+'_id" INNER JOIN "'+minifiedparentTypeName+'" ON "Pk_'+minifiedparentTypeName+'_id" = "'+args.joinTable.name+'"."'+args.joinTable.field2+'_id" WHERE "Pk_'+minifiedparentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res, TABLE)

				case "oneToOne":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-sqltypeName%>" WHERE "'+args.oneToOneInfo+'" = :value '+sorting+' '+limit+' '+offset					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

					

				default: 
					console.log('Error')
					return
			}
		}
		// List of type, not a field
		else {

			sqlParams.sql = 'SELECT * from "<%-sqltypeName%>" '+sorting+' '+limit+' '+offset
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return utils.constructOutputArray(res)
		}
	},

	async getMethods(){
		const sorting = constructSort(null)
		/******* Start of generated part using typeNameId */
		sqlParams.sql = 'SELECT * from "<%-sqltypeNameId%>" '+sorting
		/******* End of generated part using typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return utils.constructOutputArray(res)
	},

	async deleteMethods(id, directives){
		/******* Start of generated part using typeName and typeNameId */
		sqlParams.sql = 'DELETE FROM "<%-sqltypeName%>" WHERE "Pk_<%-sqltypeNameId%>_id" = '+id
		/******* End of generated part using typeName and typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return res
	},


	async updateMethods(args, directives) {

		/******* Start of generated part using updateMethodsField */
		<%- include('../database/partials/updateMethodsField.ejs', {fields: fields, relations: relations, manyToManyTables: manyToManyTables, scalarTypeNames: scalarTypeNames, scalars: scalars, getSQLTableName: utils.getSQLTableName}) _%>
		/******* End of generated part using updateMethodsField */

		// Trim the last comma to prevent SQL error
		const input = temp.slice(0, temp.lastIndexOf(", "))
		if(input !== ""){
			/******* Start of generated part using typeName and typeNameId */
			sqlParams.sql = "UPDATE \"<%-sqltypeName%>\" SET " + input + " WHERE \"Pk_<%-sqltypeName%>_id\" = " + args.id
			/******* Start of generated part using typeName and typeNameId */
			console.log(sqlParams.sql)
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return res
		}
		else{
			// The value are the same
			return
		}		
	},

	async createMethods(args, directives) {

		if("<%-typeName%>" in directives){
			directiveResolver.directiveResolver("<%-typeName%>", args, directives, resolvers)
		}

		for(a in args){
			args[a] = directiveResolver.directiveResolver(a, args, directives, resolvers)
		}
	
		/******* Start of generated part using createMethodsField */
		<%- include('../database/partials/createMethodFields.ejs', {fields: fields, relations: relations, manyToManyTables: manyToManyTables, getSQLTableName: utils.getSQLTableName, fieldsName : fieldsName, fieldsCreate: fieldsCreate, scalars : scalars, isScalar: manageScalars.isScalar, isBasicType : manageScalars.isBasicType}) _%>
		/******* End of generated part using createMethodsField */

		//return res

	},

}