const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()
const utils = require('../utils/index')
const TABLE = "<%-typeName%>"

const { Pool, Client } = require('pg')
const pool = new Pool({
	connectionString: 'postgres://postgres:postgres@aurora-gamechanger.cluster-cqx3cbuvotct.eu-west-1.rds.amazonaws.com:5432/gamechanger_db',
	idleTimeoutMillis: 500,
	user: 'postgres',
	password: 'postgres',
})

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
	database: process.env.DATABASE,
}

let commitParams = {
	secretArn: process.env.SECRETARN,
	resourceArn: process.env.RESOURCEARN,
	transactionId: ""
}

const constructSort = (args) => {
	let sorting = "ORDER BY \""

	if(args) {
		// Sort field (default Fk_<%-typeName%>_id)
		if(args.sort_field && args.sort_field !== "id") {
			sorting += args.sort_field +"\" "
		}
		else {
			sorting += "Pk_<%-typeNameId%>_id\" "
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
		sorting +=  "Pk_<%-typeNameId%>_id\" ASC"
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
			sqlParams.sql = 'SELECT * from "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = :value'
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
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = (SELECT "Fk_<%-typeNameId%>_id" FROM "'+parentTypeName+'" WHERE "'+parentTypeName+'"."Pk_'+parentTypeName+'_id" = :value)'
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// N currentType for one parentType
				case "manyToOne":
				case "manyOnly":
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeName%>"."Fk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)

				// N currentType for N parentType (Junction table)
				case "manyToMany":
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" INNER JOIN "'+args.tableJunction+'" ON "Pk_<%-typeName%>_id" = "'+args.tableJunction+'"."<%-typeName%>_id" INNER JOIN "'+parentTypeName+'" ON "Pk_'+parentTypeName+'_id" = "'+args.tableJunction+'"."'+parentTypeName+'_id" WHERE "Pk_'+parentTypeName+'_id" = :value '+sorting+' '+limit+' '+offset
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res, TABLE)

				// One unique currentType for one unique parentType 
				case "oneToOneParent":
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeName%>"."Pk_<%-typeNameId%>_id" = :value'
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				// One unique currentType for one unique parentType 
				case "oneToOneChild":
					sqlParams.sql = 'SELECT * FROM "<%-typeName%>" WHERE "<%-typeNameId%>".\"Pk_'+parentTypeName+'_id\" = :value'
					res = await rdsDataService.executeStatement(sqlParams).promise()
					return utils.constructOutputArray(res)[0]

				<%if(querySelfJoinOne){%>
					case "selfJoinOne":
						sqlParams.sql = '<%-querySelfJoinOne%>'
						res = await rdsDataService.executeStatement(sqlParams).promise()
						return utils.constructOutputArray(res)[0]<%}%>

					<%if(querySelfJoinMany){%>
						case "selfJoinMany":
							sqlParams.sql = '<%-querySelfJoinMany%>'
							res = await rdsDataService.executeStatement(sqlParams).promise()
							return utils.constructOutputArray(res)<%}%>

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
		sqlParams.sql = 'SELECT * from "<%-typeNameId%>" '+sorting
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return utils.constructOutputArray(res)
	},

	async deleteMethods(id){
		sqlParams.sql = 'DELETE FROM "<%-typeName%>" WHERE "Pk_<%-typeNameId%>_id" = '+id
		const res = await rdsDataService.executeStatement(sqlParams).promise()
		return res
	},


	async updateMethods(args) {


		<%-updateMethodsField%>

		// Trim the last comma to prevent SQL error
		const input = temp.slice(0, temp.lastIndexOf(", "))
		if(input !== ""){
			sqlParams.sql = "UPDATE \"<%-typeName%>\" SET " + input + " WHERE \"Pk_<%-typeName%>_id\" = " + args.id
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


			sqlParams.sql = "INSERT INTO \"<%-typeName%>\" VALUES (" + <%-fieldsCreate%> + ") "
			const res = await rdsDataService.executeStatement(sqlParams).promise()
				<%-createMethodsField%>
			return res

	},

}