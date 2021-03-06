const Generator = require('yeoman-generator');
const pluralize = require('pluralize')
const parsing = require('./parsing')
const easygraphqlSchemaParser = require('easygraphql-parser')
const constants = require('./constants');

const sdlSchema =
	`type User {
  id: ID!
  username: String!
  email: String!
}

type Post {
  id: ID!
}


type Blog {
  id: ID!
}
`;
module.exports = class extends Generator {
	// The name `constructor` is important here
	constructor(args, opts) {

		super(args, opts)

		// Project Name
		this.argument('appName', { required: true })

		// Graphql schema
		this.argument("graphqlFile", { type: String, required: false });
	}


	/** Base run loop lifecycle */

	//Your initialization methods (checking current project state, getting configs, etc)
	initializing() {
		this.log("Initializing")
	}

	// Where you prompt users for options (where you’d call this.prompt())
	async prompting() {
		this.log("Prompting")
		this.log("Please answer these informations to set up your project")
		this.answers = await this.prompt([
			{
				type: "input",
				name: "name",
				message: "Your project name",
				default: this.options.appName
			},
			{
				type: "input",
				name: "description",
				message: "Project description",
				default: ""
			},
			{
				type: "input",
				name: "version",
				message: "Project version",
				default: "1.0.0"
			},
			{
				type: "input",
				name: "author",
				message: "Project author",
				default: ""
			},
		])

		this.file_old_json = null;
		this.override = false;
		// Checking if project already existing
		if (this.fs.exists(this.answers.name + "/graphql/schema.js")) {
			this.log("Warning : Project already existing, all the types not corresponding will be removed, press Enter to confirm or ctrl+c to abort")
			this.override = await this.prompt([
				{
					type: "confirm",
					name: "value",
					message: "I know what I'm doing",
				}
			])

			if(this.override.value){
				this.override = true
				this.file_old_json = this.fs.read(this.answers.name+'/schema.json')
			}

		}
		this.fs.delete(this.answers.name + "/graphql")
		if (this.fs.exists(this.answers.name + "/database/handler.js")) {
			this.fs.delete(this.answers.name + "/database")
		}
	}

	// Saving configurations and configure the project (creating .editorconfig files and other metadata files)
	configuring() {
		this.log("Configuring")
	}

	// Get the graphql file
	reading() {
		this.log("Reading")
		if (this.options.graphqlFile) {
			if (this.options.graphqlFile.includes('.graphql')) {
				this.log("Fetching schema from " + this.options.graphqlFile)
				this.schema = this.fs.read(this.options.graphqlFile)

				// Parsing as a JSON object
				this.schemaJSON = easygraphqlSchemaParser(this.schema)

				// Get all the types
				this.types = parsing.getAllTypes(this.schemaJSON)
				// Get all the types Name
				this.typesName = parsing.getAllTypesName(this.schemaJSON)

				// Check if the schema is valid
				let isValidSchema = parsing.isSchemaValid(this.typesName, this.types)
				if(!isValidSchema.response) {
					throw new Error("Incorrect schema, please write a valid graphql schema based on the supported guidelines.\nReason: " + isValidSchema.reason)
				}
				else {
					this.log("Valid schema")
				}
			}
			else {
				this.log("Invalid graphql schema")
				return 0
			}
		}
		else {
			// this.schema = sdlSchema
			throw new Error("Required schema not found in argument")
		}

	}

	// If the method name doesn’t match a priority, it will be pushed to this group.
	default() {
		this.log("Default")
	}

	// Where you write the generator specific files (routes, controllers, etc)
	writing() {

		// Move the root directory to perform the scaffolding
		this.destinationRoot(this.options.appName)
		this.fs.writeJSON("schema.json", this.schemaJSON)

		// All the potential types linked by interface
		this.typesInterface = null

		// Will hold all the interfaces that each type depends on (0 to N)
		this.interfaces = null

		// Handle the scalars
		this.scalarTypeNames = this.types.map((type, index) => {
			if (type.type === "ScalarTypeDefinition")
				return this.typesName[index]
		})

		this.defaultScalars = []
		for (const scalarName in constants) {
			if (constants.hasOwnProperty(scalarName)) {
				this.defaultScalars.push(constants[scalarName])
			}
		}

		// Get all the relations between entities
		this.relations = parsing.getRelations(this.types, this.typesName, this.scalarTypeNames)

		// Get all the name of manyToMany relation table
		this.manyToManyTables = parsing.getManyToManyTables(this.relations, this.types, this.typesName)

		// Will hold all the informations on the tables 
		this.tables = parsing.getAllTables(this.types, this.typesName, this.relations, this.scalarTypeNames)

		// Adding the junction table if some exeits
		this.manyToManyTables.forEach(table => {
			this.tables.push(table)
		})

		for (let index = 0; index < this.types.length; index++) {

			let currentTypeName = this.typesName[index]
			let currentType = this.types[index]
			let isQuery = currentTypeName === "Query" ? true : false

			this.log("TYPE : " + currentTypeName)

			// Fetch all the fields for one type
			let fields = parsing.getFields(currentType)

			// Get the right syntax to add as a string (currentType.type indicates the graphql type (Object, Interface, etc.))
			let fieldsParsed = parsing.getFieldsParsed(currentTypeName, fields, currentType.type, this.relations, this.manyToManyTables, this.typesName, this.defaultScalars)

			// Get the const require 
			let requireTypes = parsing.getRequire(fields, currentType, this.defaultScalars)

			// Get the graphqlType 
			let graphqlType = parsing.getGraphqlType(currentType)

			// Check if it's a child in one to one relations
			let isOneToOneChild = false
			let parent = ""
			fields.forEach(field => {
				if (parsing.getRelationBetween(currentTypeName, field.type, this.relations) === "oneToOneChild") {
					isOneToOneChild = true
					parent = field.type
				}
			})
			let typeNameId = isOneToOneChild ? parent : currentTypeName

			if (graphqlType === "GraphQLInterfaceType") {

				// Check if this.typesInterface is already initialised
				if (!this.typesInterface) {
					this.typesInterface = []
				}
				this.typesInterface.push(currentTypeName + "Type")


				let resolveType = parsing.getResolveType(currentType, currentTypeName)
				// Adding the types graphql files
				this.fs.copyTpl(
					this.templatePath('graphql/type.js'),
					this.destinationPath('graphql/types/' + currentTypeName.toLowerCase() + '.js'),
					{
						graphqlType: graphqlType, //EnumType, ObjectType, InterfaceType
						interfaces: null, // An interface doesn't implement other interface
						typeRequire: requireTypes,
						typeName: currentTypeName,
						typeFields: fieldsParsed,
						resolveType: resolveType
					}
				)
			}

			else if (graphqlType === "GraphQLEnumType") {
				this.fs.copyTpl(
					this.templatePath('graphql/typeEnum.js'),
					this.destinationPath('graphql/types/' + currentTypeName.toLowerCase() + '.js'),
					{
						enumName: currentTypeName,
						enumValues: parsing.getEnumValues(currentType),
					}
				)
			}

			else if (graphqlType === "GraphQLScalarType") {

				if (!this.defaultScalars.includes(currentTypeName)) {
					this.fs.copyTpl(
						this.templatePath('graphql/typeScalar.js'),
						this.destinationPath('graphql/types/' + currentTypeName.toLowerCase() + '.js'),
					)
				}
			}

			else {
				// Check if it implements an interface (array non empty)
				if (currentType.implementedTypes[0]) {
					// Check if this.typesInterface is already initialised
					if (!this.typesInterface) {
						this.typesInterface = []
					}
					this.typesInterface.push(currentTypeName + "Type")

					if (!this.interfaces) {
						this.interfaces = []
					}
					currentType.implementedTypes.forEach(interfaceElement => {
						this.interfaces.push(interfaceElement + "Type")
					});
				}


				// Adding the types graphql files

				if (currentTypeName === "Query") {

					this.fs.copyTpl(
						this.templatePath('graphql/query.js'),
						this.destinationPath('graphql/types/query.js'),
						{
							typesName: this.typesName,
							scalarTypeNames: this.scalarTypeNames,
							pluralize: pluralize,
							otherQuery: fieldsParsed
						}
					)
				}

				else if (currentTypeName === "Mutation") {
					this.fs.copyTpl(
						this.templatePath('graphql/mutation.js'),
						this.destinationPath('graphql/types/mutation.js'),
						{
							defaultScalars: this.defaultScalars,
							typesName: this.typesName,
							types: this.types,
							mutationFields: parsing.getMutationFields(this.typesName, this.types, this.defaultScalars),
							otherMutation: fieldsParsed
						}
					)
				}

				else {
					this.fs.copyTpl(
						this.templatePath('graphql/type.js'),
						this.destinationPath('graphql/types/' + currentTypeName.toLowerCase() + '.js'),
						{
							graphqlType: graphqlType,
							interfaces: this.interfaces ? this.interfaces : null,
							typeRequire: requireTypes,
							typeName: currentTypeName,
							typeFields: fieldsParsed,
							resolveType: false
						}
					)
				}
				// Reset this.interface array for the next object
				this.interfaces = null

				// No need for a queryType handler
				if (!isQuery && currentTypeName !== "Mutation") {
					let queryManyToMany = "SELECT * FROM \"" + currentTypeName + "\" INNER JOIN \"'+args.tableJunction+'\" ON \"Pk_" + currentTypeName + "_id\" = \"'+args.tableJunction+'\".\"" + currentTypeName + "_id\" INNER JOIN \"'+parentTypeName+'\" ON \"Pk_'+parentTypeName+'_id\" = \"'+args.tableJunction+'\".\"'+parentTypeName+'_id\" WHERE \"Pk_'+parentTypeName+'_id\" = $1"
					let queryOneToMany = "SELECT * FROM \"" + currentTypeName + "\" WHERE \"Pk_" + typeNameId + "_id\" = (SELECT \"Fk_" + typeNameId + "_id\" FROM \"'+parentTypeName+'\" WHERE \"'+parentTypeName+'\".\"Pk_'+parentTypeName+'_id\" = $1)"
					let queryManyToOne = "SELECT * FROM \"" + currentTypeName + "\" WHERE \"" + currentTypeName + "\".\"Fk_'+parentTypeName+'_id\" = $1 '+limit+' '+offset"
					// One To One queries
					// Parent
					let queryOneToOneParent = "SELECT * FROM \"" + currentTypeName + "\" WHERE \"" + currentTypeName + "\".\"Pk_" + typeNameId + "_id\" = $1"
					// Child
					let queryOneToOneChild = "SELECT * FROM \"" + currentTypeName + "\" WHERE \"" + typeNameId + "\".\"Fk_'+parentTypeName+'_id\" = $1"

					// Adding the handlerType.js file
					this.fs.copyTpl(
						this.templatePath('database/typeHandler.js'),
						this.destinationPath('database/handlers/handler' + currentTypeName + '.js'),
						{
							typeName: currentTypeName,
							typeNameId: typeNameId,
							typeFieldsParsed: parsing.getFieldsParsedHandler(currentTypeName, fields, isOneToOneChild, parent),
							queryManyToMany: queryManyToMany,
							queryOneToMany: queryOneToMany,
							queryOneToOneParent: queryOneToOneParent,
							queryOneToOneChild: queryOneToOneChild,
							queryManyToOne: queryManyToOne,
							querySelfJoinOne: parsing.isSelfJoinOne(currentTypeName, this.relations.selfJoinOne) ? parsing.getQuerySelfJoinOne(currentTypeName, fields) : false,
							querySelfJoinMany: parsing.isSelfJoinMany(currentTypeName, this.relations.selfJoinMany) ? parsing.getQuerySelfJoinMany(currentTypeName, fields) : false,
							updateMethodsField: parsing.getUpdateMethodsField(currentTypeName, fields, this.relations, this.manyToManyTables, this.scalarTypeNames),
							fieldsCreate: parsing.getFieldsCreate(currentTypeName, fields, this.relations, this.manyToManyTables),
							createMethodsField: parsing.getCreateMethodsField(currentTypeName, fields, this.relations, this.manyToManyTables)
						}
					)
				}
			}

			this.log("\n")
		}

		// Check if mutation and query type files already exists and add a default one if not
		if (!this.fs.exists("graphql/types/mutation.js")) {
			console.log("Mutation file not present")
			this.fs.copyTpl(
				this.templatePath('graphql/mutation.js'),
				this.destinationPath('graphql/types/mutation.js'),
				{
					defaultScalars: this.defaultScalars,
					typesName: this.typesName,
					types: this.types,
					mutationFields: parsing.getMutationFields(this.typesName, this.types, this.defaultScalars),
					otherMutation: ""
				}
			)
		}

		if (!this.fs.exists("graphql/types/query.js")) {
			this.fs.copyTpl(
				this.templatePath('graphql/query.js'),
				this.destinationPath('graphql/types/query.js'),
				{
					typesName: this.typesName,
					scalarTypeNames: this.scalarTypeNames,
					pluralize: pluralize,
					otherQuery: ""
				}
			)
		}
		
		// Adding the rootQuery Schema
		let paramsSchema
		if (this.typesInterface) {
			paramsSchema = {
				typesInterface: this.typesInterface
			}
		}
		else {
			paramsSchema = { typesInterface: false }
		}

		this.fs.copyTpl(
			this.templatePath('graphql/schema.js'),
			this.destinationPath('graphql/schema.js'),
			paramsSchema
		)

		this.fs.copyTpl(
			this.templatePath('graphql/defaultScalarsMap.js'),
			this.destinationPath('graphql/defaultScalarsMap.js'),
		)

		//Adding the handler.js file (main handler)
		this.fs.copyTpl(
			this.templatePath('database/globalHandler.js'),
			this.destinationPath('database/handler.js'),
			{
				handlerRequire: parsing.getHandlerRequire(this.typesName, this.types),
				handlerGetSwitchCase: parsing.getHandlerGetSwitchCase(this.typesName, this.types),
				handlerDeleteSwitchCase: parsing.getHandlerDeleteSwitchCase(this.typesName, this.types),
				handlerUpdateSwitchCase: parsing.getHandlerUpdateSwitchCase(this.typesName, this.types),
				handlerCreateSwitchCase: parsing.getHandlerCreateSwitchCase(this.typesName, this.types)
			}
		)

		//Adding the utils file for the database
		this.fs.copyTpl(
			this.templatePath('database/utils.js'),
			this.destinationPath('database/utils/index.js'),
		)

		// Entry point of the lambdas function (index.js)
		let importUpdateLine = ''
		let requestUpdate = ''
		if(this.override === true){
			importUpdateLine = 'const updateDatabase = require (\'./upgradeDatabase/upgradeDatabase\')'
			requestUpdate = 'else if(event["updateDatabase"]) {\n' +
				'    updateDatabase.updateDatabase()\n' +
				'    callback(null, {statusCode: 200, body: JSON.stringify("Done")})\n' +
				'  }'
		}
		this.fs.copyTpl(
			this.templatePath('index.js'),
			this.destinationPath('index.js'),
			{
				importUpdate : importUpdateLine,
				updateRequest : requestUpdate
			}
		)

		// Adding the file for each model
		this.fs.copyTpl(
			this.templatePath('initDatabase/models.js'),
			this.destinationPath('initDatabase/models.js'),
			{
				creationOfModels: parsing.getCreationOfModels(this.types, this.typesName, this.relations, this.scalarTypeNames),
				listOfModelsExport: parsing.getListOfModelsExport(this.typesName, this.types)
			}
		)

		// Adding the file which init the database
		this.fs.copyTpl(
			this.templatePath('initDatabase/initDatabase.js'),
			this.destinationPath('initDatabase/initDatabase.js'),
			{
				createTables: parsing.getInitCreateTable(this.tables),
				addConstraints: parsing.getInitAddConstraints(this.tables)
			}
		)

		// Adding the file which fill the tables
		this.fs.copyTpl(
			this.templatePath('initDatabase/fillTables.js'),
			this.destinationPath('initDatabase/fillTables.js'),
			{
				listOfMethodsForInit: parsing.getListOfMethodsForInit(this.types, this.typesName, this.relations),
				initEachModelsJS: parsing.getInitEachModelsJS(this.tables),
				initEachFieldsModelsJS: parsing.getInitEachFieldsModelsJS(this.types, this.typesName),
				initQueriesInsert: parsing.getInitQueriesInsert(this.tables)
			}
		)

		// Adding the file which drop all tables
		this.fs.copyTpl(
			this.templatePath('cleanDatabase/dropTables.js'),
			this.destinationPath('cleanDatabase/dropTables.js'),
			{
				dropTables: parsing.getDropTables(this.tables),
			}
		)


		// Adding the file which clean all tables
		this.fs.copyTpl(
			this.templatePath('cleanDatabase/cleanTables.js'),
			this.destinationPath('cleanDatabase/cleanTables.js'),
			{
				cleanTables: parsing.getCleanTables(this.tables),
			}
		)

		// Adding the file which check if all tables exists in database
		this.fs.copyTpl(
			this.templatePath('existTable/existTable.js'),
			this.destinationPath('existTable/existTable.js'),
			{
				entitiesForExist: parsing.getEntitiesForExist(this.tables),
			}
		)

		this.fs.copyTpl(
			this.templatePath('terraform/apigateway.tf'),
			this.destinationPath('terraform/apigateway.tf'),
			{
				appname: parsing.formatName(this.answers.name)
			}
		)

		this.fs.copyTpl(
			this.templatePath('terraform/cognito.tf'),
			this.destinationPath('terraform/cognito.tf'),
			{
				appname: parsing.formatName(this.answers.name)
			}
		)
		this.fs.copyTpl(
			this.templatePath('terraform/iam.tf'),
			this.destinationPath('terraform/iam.tf'),
			{
				appname: parsing.formatName(this.answers.name)
			}
		)
		this.fs.copyTpl(
			this.templatePath('terraform/lambda.tf'),
			this.destinationPath('terraform/lambda.tf'),
			{
				appname: parsing.formatName(this.answers.name)
			}
		)
		this.fs.copyTpl(
			this.templatePath('terraform/main.tf'),
			this.destinationPath('terraform/main.tf'),
		)
		this.fs.copyTpl(
			this.templatePath('terraform/rds.tf'),
			this.destinationPath('terraform/rds.tf'),
		)
		this.fs.copyTpl(
			this.templatePath('terraform/secret.tf'),
			this.destinationPath('terraform/secret.tf'),
		)
		this.fs.copyTpl(
			this.templatePath('terraform/variables.tf'),
			this.destinationPath('terraform/variables.tf'),
		)
		this.fs.copyTpl(
			this.templatePath('terraform/terraform.tfvar'),
			this.destinationPath('terraform/terraform.tfvar'),
			{
				appname: parsing.formatName(this.answers.name)
			}
		)

		// Adding the package.json config file
		this.fs.copyTpl(
			this.templatePath('package.json'),
			this.destinationPath('package.json'),
			{
				appName: this.answers.name,
				appDescription: this.answers.description,
				appVersion: this.answers.version,
				appAuthor: this.answers.author,
			}
		)

		this.add_entities = []
		this.update_entities = []
		this.delete_entities = []
		if(this.override == true){
			this.old_schema = JSON.parse(this.file_old_json)
			this.new_schema = this.schemaJSON
			let arr = parsing.compareSchema(this.old_schema, this.new_schema)
			arr[0].forEach(x => this.add_entities.push(parsing.findTable(this.tables, x)))
			this.update_entities = arr[1]
			this.delete_entities = arr[2]
			this.add_fields = []
			console.log("ADD ENTITIES - ", this.add_entities)
			console.log("DELETE ENTITIES - ", this.delete_entities)
			console.log("UPDATE : ", this.update_entities)
			this.update_entities[0].forEach(add => {
				if(add.length > 0) {
					add.forEach(x => {
						let table = parsing.findTable(this.tables, x.name)
						let name = x.column.name
						let type = x.column.type
						if (type !== "String" && type !== "ID" && type !== "Int" && type != "Boolean"
						&& type !== "DateTime" && type !== "Date" && type !== "Time" && type !== "URL") {
							name = "Fk_" + type + "_id"
						}
						this.add_fields.push({name: x.name, column: parsing.findField(table.columns, name)})

					})
				}
			})
			this.update_fields = []
			this.update_entities[1].forEach(up => {
				if(up.length > 0) {
					up.forEach(x => {
						this.update_fields.push(x)
					})
				}
			})
			this.delete_fields = []
			this.update_entities[2].forEach(del => {
				if(del.length > 0) {
					del.forEach(x => {
						this.delete_fields.push(x)
					})
				}
			})
			console.log("ADD FIELDS - ", this.add_fields)
			console.log("UPDATE FIELDS - ", this.update_fields)
			console.log("DELETE FIELDS - ", this.delete_fields)
			this.fs.copyTpl(
				this.templatePath('upgradeDatabase/upgradeDatabase.js'),
				this.destinationPath('upgradeDatabase/upgradeDatabase.js'),
				{
					deleteTables: parsing.getDropTables(this.delete_entities),
					createTables: parsing.getInitCreateTable(this.add_entities),
					addConstraints: parsing.getInitAddConstraints(this.add_entities),
					deleteColumns: parsing.getQueriesDeleteFields(this.delete_fields),
					addColumns: parsing.getQueriesAddFields(this.add_fields),
					updateColumns: parsing.getQueriesUpdateFields(this.update_fields)


				}
			)
		}


	}

	// Where conflicts are handled (used internally)
	conflicts() {
		this.log("Conflicts")
	}

	// Where installations are run (npm, bower)
	install() {
		this.log("Install")
		this.npmInstall(['graphql', 'aws-sdk', 'pg', 'rds-data', 'faker', 'validator', 'graphql-scalars'])
	}

	// Called last, cleanup, say good bye, etc
	end() {
		this.log("Done, now use the terraform commands writtent in README.md to deploy your lambdas")
	}

}

