const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../utils/index')

/******* Start of generated part (except for 'const TABLE = ' ) using typeName */
const TABLE = "Meta"
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
		// Sort field (default Fk_Meta_id)
		if(args.sort_field && args.sort_field !== "id") {
			sorting += args.sort_field +"\" "
		}
		else {
			/******* Start of generated part (except for 'sorting += "Pk_' ) using typeNameId */
			sorting += "Pk_Meta_id\" "
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
		sorting +=  "Pk_Meta_id\" ASC"
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
			sqlParams.sql = 'SELECT * from "Meta" WHERE "Pk_Meta_id" = :value'
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
					sqlParams.sql = 'SELECT * FROM "Meta" WHERE "Pk_Meta_id" = (SELECT "Fk_Meta_id" FROM "'+parentTypeName+'" WHERE "'+parentTypeName+'"."Pk_'+parentTypeName+'_id" = :value)'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// N currentType for one parentType
				case "manyToOne":
				case "manyOnly":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "Meta" WHERE "Meta"."Fk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)

				// N currentType for N parentType (Junction table)
				case "manyToMany":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "Meta" INNER JOIN "'+args.tableJunction+'" ON "Pk_Meta_id" = "'+args.tableJunction+'"."Meta_id" INNER JOIN "'+parentTypeName+'" ON "Pk_'+parentTypeName+'_id" = "'+args.tableJunction+'"."'+parentTypeName+'_id" WHERE "Pk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res, TABLE)

				// One unique currentType for one unique parentType 
				case "oneToOneParent":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "Meta" WHERE "Meta"."Pk_Meta_id" = :value'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// One unique currentType for one unique parentType 
				case "oneToOneChild":
					/******* Start of generated part using typeName and typeNameId */
					sqlParams.sql = 'SELECT * FROM "Meta" WHERE "Meta".\"Pk_'+parentTypeName+'_id\" = :value'
					/******* End of generated part using typeName and typeNameId   */
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				/******* Conditional Block on querySelfJoinOne */
				
				/******* End of conditional Block on querySelfJoinOne */
		
				/******* Conditional Block on querySelfJoinMany */
					
				/******* End of conditional Block on querySelfJoinMany */			

				default: 
					console.log('Error')
					return
			}
		}
		// List of type, not a field
		else {

			sqlParams.sql = 'SELECT * from "Meta" '+sorting+' '+limit+' '+offset
			const res = await rdsDataService.executeStatement(sqlParams).promise()
			return utils.constructOutputArray(res)
		}
	},

	async getMethods(){
		const sorting = constructSort(null)
		/******* Start of generated part using typeNameId */
		sqlParams.sql = 'SELECT * from "Meta" '+sorting
		/******* End of generated part using typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return utils.constructOutputArray(res)
	},

	async deleteMethods(id){
		/******* Start of generated part using typeName and typeNameId */
		sqlParams.sql = 'DELETE FROM "Meta" WHERE "Pk_Meta_id" = '+id
		/******* End of generated part using typeName and typeNameId */
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return res
	},


	async updateMethods(args) {

		/******* Start of generated part using updateMethodsField */
		let temp = ''

if(args.count !== undefined){temp += args.count ? "\"count\" = '" + utils.escapeQuote(args.count) + "', " : "\"count\" = null, "
}


		/******* End of generated part using updateMethodsField */

		// Trim the last comma to prevent SQL error
		const input = temp.slice(0, temp.lastIndexOf(", "))
		if(input !== ""){
			/******* Start of generated part using typeName and typeNameId */
			sqlParams.sql = "UPDATE \"Meta\" SET " + input + " WHERE \"Pk_Meta_id\" = " + args.id
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

			/******* Start of generated part (except 'sqlParams.sql = "INSERT INTO \"Meta\" VALUES (') using fieldsCreate */
			sqlParams.sql = "INSERT INTO \"Meta\" VALUES (" + args.id + "," +args.count  + ") "
			/******* End of generated part using fieldsCreate */

			const res = await rdsDataService.executeStatement(sqlParams).promise()
			/******* Start of generated part using createMethodsField */
				
			/******* End of generated part using createMethodsField */

			return res

	},

}