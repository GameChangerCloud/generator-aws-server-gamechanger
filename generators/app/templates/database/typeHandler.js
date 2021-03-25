const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../utils/index')

/******* Start of generated part (except for 'const TABLE = ' ) using typeName */
const TABLE = "<%-typeName%>"
/******* End of generated part using typeName */

let sqlParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	sql: "",
	database: process.env.DATABASE,
	includeResultMetadata: true,
	parameters: []
}

const constructSort = (args) => {
	let sorting = "ORDER BY \""

	if(args) {
		// Sort field (default Fk_<%-typeName%>_id)
		if(args.sort_field && args.sort_field !== "id") {
			sorting += args.sort_field +"\" "
		}
		else {
			/******* Start of generated part (except for 'sorting += "Pk_' ) using typeNameId */
			sorting += "Pk_<%-typeNameId%>_id\" "
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
		sorting +=  "Pk_<%-typeNameId%>_id\" ASC"
		/******* End of generated part using typeNameId */
	}

	return sorting
}
    
module.exports = {
    
	async getMethodsByArgs (args){

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
			sqlParams.sql = 'SELECT * from "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = :value'
			/******* End of generated part using typeName and typeNameId */
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return utils.constructOutputArray(res)[0] // only one row
		}
		
		// Field from a parent type (other than query)
		else if(args.parentId) {
			const value = args.parentId
			const parentTypeName = args.parentTypeName.toString().replace("Type", "")
			let res 
			sqlParams.parameters.length = 0
			sqlParams.parameters.push({name: 'value', value: {longValue: value}})

			switch(args.relationType) {
				
				// One unique currentType for N parentType
				case "oneToMany":
				case "oneOnly":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = (SELECT "Fk_<%-typeNameId%>_id" FROM "'+parentTypeName+'" WHERE "'+parentTypeName+'"."Pk_'+parentTypeName+'_id" = :value)'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// N currentType for one parentType
				case "manyToOne":
				case "manyOnly":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeName%>"."Fk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)

				// N currentType for N parentType (Junction table)
				case "manyToMany":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" INNER JOIN "'+args.tableJunction+'" ON "Pk_<%-typeName%>_id" = "'+args.tableJunction+'"."<%-typeName%>_id" INNER JOIN "'+parentTypeName+'" ON "Pk_'+parentTypeName+'_id" = "'+args.tableJunction+'"."'+parentTypeName+'_id" WHERE "Pk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res, TABLE)

				// One unique currentType for one unique parentType 
				case "oneToOneParent":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeName%>"."Pk_<%-typeNameId%>_id" = :value'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// One unique currentType for one unique parentType 
				case "oneToOneChild":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeNameId%>".\"Pk_'+parentTypeName+'_id\" = :value'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				/******* Conditional Block on querySelfJoinOne */
				<%if(querySelfJoinOne){%>
					case "selfJoinOne":
						sqlParams.sql = '<%-querySelfJoinOne%>'
						res = await rdsDataService.executeStatement(sqlParams).promise()
						return utils.constructOutputArray(res)[0]<%}%>
				/******* End of conditional Block on querySelfJoinOne */
		
				/******* Conditional Block on querySelfJoinMany */
					<%if(querySelfJoinMany){%>
						case "selfJoinMany":
							sqlParams.sql = '<%-querySelfJoinMany%>'
							res = await rdsDataService.executeStatement(sqlParams).promise()
							return utils.constructOutputArray(res)<%}%>
				/******* End of conditional Block on querySelfJoinMany */			

				default: 
					console.log('Error')
					return
			}
		}
		// List of type, not a field
		else {

			sqlParams.sql = 'SELECT * from "<%-typeName%>" '+sorting+' '+limit+' '+offset
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return utils.constructOutputArray(res)
		}
	},

	async getMethods(){
		const sorting = constructSort(null)
		/******* Start of generated part using typeNameId */
		sqlParams.sql = 'SELECT * from "<%-typeNameId%>" '+sorting
		/******* End of generated part using typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return utils.constructOutputArray(res)
	},

	async deleteMethods(id){
		/******* Start of generated part using typeName and typeNameId */
		sqlParams.sql = 'DELETE FROM "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = '+id
		/******* End of generated part using typeName and typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return res
	},


	async updateMethods(args) {

		/******* Start of generated part using updateMethodsField */
		<%- include('../database/partials/updateMethodsField.ejs', {fields: fields, relations: relations, manyToManyTables: manyToManyTables, scalarTypeNames: scalarTypeNames, scalars: scalars}) _%>
		/******* End of generated part using updateMethodsField */

		// Trim the last comma to prevent SQL error
		const input = temp.slice(0, temp.lastIndexOf(", "))
		if(input !== ""){
			/******* Start of generated part using typeName and typeNameId */
			sqlParams.sql = "UPDATE \"<%-typeName%>\" SET " + input + " WHERE \"Pk_<%-typeName%>_id\" = " + args.id
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

	async createMethods(args) {

			/******* Start of generated part (except 'sqlParams.sql = "INSERT INTO \"<%-typeName%>\" VALUES (') using fieldsCreate */
			sqlParams.sql = "INSERT INTO \"<%-typeName%>\" VALUES (" + <%-fieldsCreate%> + ") "
			/******* End of generated part using fieldsCreate */

			const res = await rdsDataService.executeStatement(sqlParams).promise()
			/******* Start of generated part using createMethodsField */
				<%-createMethodsField%>
			/******* End of generated part using createMethodsField */

			return res

	},

}