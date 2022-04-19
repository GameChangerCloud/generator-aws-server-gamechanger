import {
    scalars,
    schemaParser,
    Relationships,
    Type,
    isBasicType,
    isScalar,
    getSQLTableName,
    matchString,
    isSchemaValid,
    hasFieldType,
    formatName,
    findTable,
    findField,
    getFieldsParsed,
    getFieldsParsedHandler,
    getFieldsCreate,
    getFieldsName,
    getFieldsDirectiveNames,
    getDirectivesNames,
    getRequire,
    getGraphqlType,
    getResolveType,
    getEnumValues,
    getAllTables,
    getInitEachModelsJS,
    getInitEachFieldsModelsJS,
    getRelations,
    getJoinTables,
    getQuerySelfJoinOne,
    getQuerySelfJoinMany,
    compareSchema, typesGenerator
} from "easygraphql-parser-gamechanger";

const Generator = require('yeoman-generator');
const pluralize = require('pluralize')

const manageScalars = {
    isBasicType,
    isScalar
}
const matching = {
    matchString
}


module.exports = class extends Generator {
    // The name `constructor` is important hereh
    constructor(args, opts) {

        super(args, opts)

        // Project Name
        this.argument('appName', {required: true})

        // Graphql schema
        this.argument("graphqlFile", {type: String, required: true});
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
                default: "none"
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
        if (this.fs.exists(this.answers.name + "/graphql/schema.ejs")) {
            this.log("Warning : Project already existing, all the types not corresponding will be removed, press Enter to confirm or ctrl+c to abort")
            this.override = await this.prompt([
                {
                    type: "confirm",
                    name: "value",
                    message: "I know what I'm doing",
                }
            ])

            if (this.override.value) {
                this.override = true
                this.file_old_json = this.fs.read(this.answers.name + '/schema.json')
            }

        }
        this.fs.delete(this.answers.name + "/graphql")
        if (this.fs.exists(this.answers.name + "/database/handler.ejs")) {
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
                this.schemaJSON = schemaParser(this.schema)

                typesGenerator(this.schemaJSON)

            } else {
                this.log("Invalid graphql schema")
                return 0
            }
        } else {
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
        this.scalarTypeNames = this.types.filter(type => type.type === "ScalarTypeDefinition")

        this.defaultScalars = []
        for (const scalarName in scalars) {
            if (scalars.hasOwnProperty(scalarName)) {
                this.defaultScalars.push(scalars[scalarName])
            }
        }

        //this.tyty = getRelations(this.tyty.filter(type => type.type === "ObjectTypeDefinition"), this.scalarTypeNames, this.env)

        // Get all the relations between entities
        //const tmpTypes = JSON.parse(JSON.stringify(this.types)); // why ?
        this.types = getRelations(this.types.filter(type => type.type === "ObjectTypeDefinition"), this.scalarTypeNames, this.env)

        // Get all the name of join relation table
        this.joinTables = getJoinTables(this.types, this.scalarTypeNames)

        // Will hold all the informations on the tables
        this.tables = getAllTables(this.types, this.scalarTypeNames)

        // Adding the junction table if some exeits
        this.joinTables.forEach(table => {
            this.tables.push(table)
        })

        this.fs.copyTpl(
            this.templatePath('database/sqlUtils.ejs'),
            this.destinationPath('database/sqlUtils.js'),
            {
                tables: this.tables
            }
        )

        let typesNameArray = this.types.map(type => type.typeName)


        let schemaDirectives = getDirectivesNames()

        for (let index = 0; index < this.types.length; index++) {
            let currentType = this.types[index]
            let isQuery = currentType.typeName === "Query" ? true : false

            this.log("Processing TYPE : " + currentType.typeName)

            // Get all the fields directives names

            let directiveNames = getFieldsDirectiveNames(this.types[index])

            // Get the right syntax to add as a string (currentType.type indicates the graphql type (Object, Interface, etc.))
            //let fieldsParsed = getFieldsParsed(currentType, this.relations, this.joinTables, typesNameArray, this.defaultScalars)
            let fieldsParsed = getFieldsParsed(currentType, this.joinTables, typesNameArray, this.defaultScalars)

            // Get the const require
            let requireTypes = getRequire(currentType, this.defaultScalars)

            // Get the graphqlType
            let graphqlType = getGraphqlType(currentType)

            // Check if it's a child in one to one relations
            let isOneToOneChild = false
            let parent = ""
            // Create File with directives by type

            if (index == 0) {
                this.fs.copyTpl(
                    this.templatePath('graphql/directives/directivesOnTypes.ejs'),
                    this.destinationPath('directives/directivesOnTypes.js'),
                    {
                        defaultScalars: this.defaultScalars,
                        types: this.types,
                        fields: currentType.fields,
                        //mutationFields: parsing.getMutationFields(this.typesName, this.types, this.defaultScalars),
                        otherMutation: fieldsParsed
                    }
                )
            }

            currentType.fields.forEach((field) => {
                if (field.relation === "oneToOneChild") {
                    isOneToOneChild = true
                    parent = field.type
                }
            })
            let typeNameId = isOneToOneChild ? parent : currentType.typeName
            let sqltypeNameId = getSQLTableName(typeNameId)
            if (graphqlType === "GraphQLInterfaceType") {

                // Check if this.typesInterface is already initialised
                if (!this.typesInterface) {
                    this.typesInterface = []
                }
                this.typesInterface.push(currentType.typeName + "Type")


                let resolveType = getResolveType(currentType, currentType.typeName)
                // Adding the types graphql files
                this.fs.copyTpl(
                    this.templatePath('graphql/type.ejs'),
                    this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
                    {
                        type: currentType,
                        graphqlType: graphqlType, //EnumType, ObjectType, InterfaceType
                        interfaces: null, // An interface doesn't implement other interface
                        typeRequire: requireTypes,
                        typeName: currentType.typeName,
                        typeFields: fieldsParsed,
                        resolveType: resolveType
                    }
                )
            } else if (graphqlType === "GraphQLEnumType") {
                this.fs.copyTpl(
                    this.templatePath('graphql/typeEnum.ejs'),
                    this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
                    {
                        enumName: currentType.typeName,
                        enumValues: getEnumValues(currentType),

                    }
                )
            } else if (graphqlType === "GraphQLScalarType") {

                if (!this.defaultScalars.includes(currentType.typeName)) {
                    this.fs.copyTpl(
                        this.templatePath('graphql/typeScalar.ejs'),
                        this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
                    )
                }
            } else {  // Should be GraphQLObjectType
                // Check if it implements an interface (array non empty)
                if (currentType.implementedTypes[0]) {
                    // Check if this.typesInterface is already initialised
                    if (!this.typesInterface) {
                        this.typesInterface = []
                    }
                    this.typesInterface.push(currentType.typeName + "Type")

                    if (!this.interfaces) {
                        this.interfaces = []
                    }
                    currentType.implementedTypes.forEach(interfaceElement => {
                        this.interfaces.push(interfaceElement + "Type")
                    });
                }


                // Adding the types graphql files

                if (currentType.typeName === "Query") {

                    this.fs.copyTpl(
                        this.templatePath('graphql/query.ejs'),
                        this.destinationPath('graphql/types/query.js'),
                        {
                            typesName: typesNameArray,
                            scalarTypeNames: this.scalarTypeNames,
                            pluralize: pluralize,
                            otherQuery: fieldsParsed
                        }
                    )
                } else if (currentType.typeName === "Mutation") {
                    this.fs.copyTpl(
                        this.templatePath('graphql/mutation.ejs'),
                        this.destinationPath('graphql/types/mutation.js'),
                        {
                            defaultScalars: this.defaultScalars,
                            types: this.types,
                            fields: currentType.fields,
                            otherMutation: fieldsParsed
                        }
                    )
                } else {
                    this.fs.copyTpl(
                        this.templatePath('graphql/type.ejs'),
                        this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
                        {
                            type: currentType,
                            graphqlType: graphqlType,
                            defaultScalars: this.defaultScalars,

                            interfaces: this.interfaces ? this.interfaces : null,
                            typeRequire: requireTypes,
                            typeName: currentType.typeName,
                            typeFields: fieldsParsed,
                            resolveType: false
                        }
                    )
                }
                // Reset this.interface array for the next object
                this.interfaces = null

                // No need for a queryType handler
                if (!isQuery && currentType.typeName !== "Mutation") {
                    let queryManyToMany = "SELECT * FROM \"" + currentType.sqlTypeName + "\" INNER JOIN \"'+args.tableJunction+'\" ON \"Pk_" + currentType.sqlTypeName + "_id\" = \"'+args.tableJunction+'\".\"" + currentType.sqlTypeName + "_id\" INNER JOIN \"'+parentTypeName+'\" ON \"Pk_'+parentTypeName+'_id\" = \"'+args.tableJunction+'\".\"'+parentTypeName+'_id\" WHERE \"Pk_'+parentTypeName+'_id\" = $1"
                    let queryOneToMany = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"Pk_" + sqltypeNameId + "_id\" = (SELECT \"Fk_" + sqltypeNameId + "_id\" FROM \"'+parentTypeName+'\" WHERE \"'+parentTypeName+'\".\"Pk_'+parentTypeName+'_id\" = $1)"
                    let queryManyToOne = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + currentType.sqlTypeName + "\".\"Fk_'+parentTypeName+'_id\" = $1 '+limit+' '+offset"
                    // One To One queries
                    // Parent
                    let queryOneToOneParent = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + currentType.sqlTypeName + "\".\"Pk_" + sqltypeNameId + "_id\" = $1"
                    // Child
                    let queryOneToOneChild = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + sqltypeNameId + "\".\"Fk_'+parentTypeName+'_id\" = $1"

                    // Adding the handlerType.js file
                    this.fs.copyTpl(
                        this.templatePath('database/typeHandler.ejs'),
                        this.destinationPath('database/handlers/handler' + currentType.typeName + '.js'),
                        {
                            currentType: currentType,
                            typeName: currentType.typeName,
                            sqltypeName: currentType.sqlTypeName,
                            sqltypeNameId: sqltypeNameId,
                            typeFieldsParsed: getFieldsParsedHandler(currentType.typeName, currentType.fields, isOneToOneChild, parent),
                            queryManyToMany: queryManyToMany,
                            queryOneToMany: queryOneToMany,
                            queryOneToOneParent: queryOneToOneParent,
                            queryOneToOneChild: queryOneToOneChild,
                            queryManyToOne: queryManyToOne,
                            querySelfJoinOne: currentType.fields.find(field => field.relationship === "selfJoinOne") ? getQuerySelfJoinOne(currentType.typeName, currentType.fields) : false,
                            querySelfJoinMany: currentType.fields.find(field => field.relationship === "selfJoinMany") ? getQuerySelfJoinMany(currentType.typeName, currentType.fields) : false,
                            fields: currentType.fields,
                            directiveNames: directiveNames,
                            relations: Relationships,
                            manyToManyTables: this.joinTables,
                            scalarTypeNames: this.scalarTypeNames,
                            scalars: scalars,
                            fieldsCreate: getFieldsCreate(currentType.typeName, currentType.fields, Relationships, this.joinTables),
                            fieldsName: getFieldsName(this.tables, currentType.fields, currentType.typeName, currentType.sqlTypeName, Relationships),
                            getSQLTableName: getSQLTableName,
                            manageScalars: manageScalars
                        }
                    )


                    //Adding DirectiveResolvers
                    this.fs.copyTpl(
                        this.templatePath('graphql/directives/directiveResolvers.ejs'),
                        this.destinationPath('database/utils/' + currentType.typeName.toLocaleLowerCase() + 'DirectiveResolvers.js'),
                        {
                            schemaDirectives: schemaDirectives,
                            dirNames: directiveNames
                        }
                    )

                    // Adding events for lambdas
                    //Create
                    this.fs.copyTpl(
                        this.templatePath('testLambdas/eventMaker.ejs'),
                        this.destinationPath('events/create' + currentType.typeName + '.json'),
                        {
                            fields: currentType.fields,
                            typeName: currentType.typeName,
                            relations: Relationships,
                            typeQuery: "create"
                        }
                    )
                    //Delete
                    this.fs.copyTpl(
                        this.templatePath('testLambdas/eventMaker.ejs'),
                        this.destinationPath('events/delete' + currentType.typeName + '.json'),
                        {
                            fields: currentType.fields,
                            typeName: currentType.typeName,
                            relations: Relationships,
                            typeQuery: "delete"
                        }
                    )

                    //Update
                    this.fs.copyTpl(
                        this.templatePath('testLambdas/eventMaker.ejs'),
                        this.destinationPath('events/update' + currentType.typeName + '.json'),
                        {
                            fields: currentType.fields,
                            typeName: currentType.typeName,
                            relations: Relationships,
                            typeQuery: "update"
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
                this.templatePath('graphql/mutation.ejs'),
                this.destinationPath('graphql/types/mutation.js'),
                {
                    defaultScalars: this.defaultScalars,
                    types: this.types,
                    otherMutation: ""
                }
            )
        }

        if (!this.fs.exists("graphql/types/query.ejs")) {
            console.log("query file not present")
            this.fs.copyTpl(
                this.templatePath('graphql/query.ejs'),
                this.destinationPath('graphql/types/query.js'),
                {
                    typesName: typesNameArray,
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
        } else {
            paramsSchema = {typesInterface: false}
        }

        this.fs.copyTpl(
            this.templatePath('graphql/schema.ejs'),
            this.destinationPath('graphql/schema.js'),
            paramsSchema
        )

        this.fs.copyTpl(
            this.templatePath('graphql/defaultScalarsMap.ejs'),
            this.destinationPath('graphql/defaultScalarsMap.js'),
        )


        //Adding the handler.js file (main handler)
        this.fs.copyTpl(
            this.templatePath('database/globalHandler.ejs'),
            this.destinationPath('database/handler.js'),
            {
                tables: this.tables
            }
        )

        //Adding the utils file for the database
        this.fs.copyTpl(
            this.templatePath('database/utils.ejs'),
            this.destinationPath('database/utils/index.js'),
        )

        //Adding RuntimeDirectiveResolver
        this.fs.copyTpl(
            this.templatePath('graphql/runtimeDirectiveResolver.ejs'),
            this.destinationPath('database/utils/runtimeDirectiveResolver.js'),
        )
        // Entry point of the lambdas function (index.js)
        let importUpdateLine = ''
        let requestUpdate = ''
        if (this.override === true) {
            importUpdateLine = 'const updateDatabase = require (\'./upgradeDatabase/upgradeDatabase\')'
            requestUpdate = 'else if(event["updateDatabase"]) {\n' +
                '    updateDatabase.updateDatabase()\n' +
                '    callback(null, {statusCode: 200, body: JSON.stringify("Done")})\n' +
                '  }'
        }
        this.fs.copyTpl(
            this.templatePath('index.ejs'),
            this.destinationPath('index.js'),
            {
                importUpdate: importUpdateLine,
                updateRequest: requestUpdate
            }
        )

        // Adding the file for each model
        this.fs.copyTpl(
            this.templatePath('initDatabase/models.ejs'),
            this.destinationPath('initDatabase/models.js'),
            {
                types: this.types,
                scalarTypeNames: this.scalarTypeNames,
                relations: Relationships,
            }
        )

        // Adding the file which init the database
        this.fs.copyTpl(
            this.templatePath('initDatabase/initDatabase.ejs'),
            this.destinationPath('initDatabase/initDatabase.js'),
            {
                tables: this.tables,
            }
        )

        // Adding the file which fill the tables
        this.fs.copyTpl(
            this.templatePath('initDatabase/fillTables.ejs'),
            this.destinationPath('initDatabase/fillTables.js'),
            {
                types: this.types,
                typesName: typesNameArray,
                relations: Relationships,
                matching: matching,
                tables: this.tables,
                hasFieldType: hasFieldType,
                initEachModelsJS: getInitEachModelsJS(this.tables),
                initEachFieldsModelsJS: getInitEachFieldsModelsJS(this.types),
                getSQLTableName: getSQLTableName,
            }
        )

        // Adding the file which drop all tables
        this.fs.copyTpl(
            this.templatePath('cleanDatabase/dropTables.ejs'),
            this.destinationPath('cleanDatabase/dropTables.js'),
            {
                tables: this.tables,
            }
        )


        // Adding the file which clean all tables
        this.fs.copyTpl(
            this.templatePath('cleanDatabase/cleanTables.ejs'),
            this.destinationPath('cleanDatabase/cleanTables.js'),
            {
                tables: this.tables
            }
        )

        // Adding the file which check if all tables exists in database
        this.fs.copyTpl(
            this.templatePath('existTable/existTable.ejs'),
            this.destinationPath('existTable/existTable.js'),
            {
                tables: this.tables
            }
        )

        this.fs.copyTpl(
            this.templatePath('terraform/apigateway.tf'),
            this.destinationPath('terraform/apigateway.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )

        this.fs.copyTpl(
            this.templatePath('terraform/cognito.tf'),
            this.destinationPath('terraform/cognito.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )
        this.fs.copyTpl(
            this.templatePath('terraform/iam.tf'),
            this.destinationPath('terraform/iam.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )
        this.fs.copyTpl(
            this.templatePath('terraform/lambda.tf'),
            this.destinationPath('terraform/lambda.tf'),
            {
                appName: formatName(this.answers.name)
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
                appName: formatName(this.answers.name)
            }
        )

        // Adding lambda local test dependencies

        this.fs.copyTpl(
            this.templatePath('testLambdas/template.yaml'),
            this.destinationPath('template.yaml'),
            {
                appName: formatName(this.answers.name)
            }
        )
        this.fs.copyTpl(
            this.templatePath('readmes/README.md'),
            this.destinationPath('README.md'),
            {
                appName: formatName(this.answers.name)
            }
        )


        this.fs.copyTpl(
            this.templatePath('testLambdas/eventMaker.ejs'),
            this.destinationPath('events/fillTable.json'),
            {
                fields: null,
                typeName: "filltable",
                typeQuery: "fillTable"
            }
        )
        this.fs.copyTpl(
            this.templatePath('testLambdas/eventMaker.ejs'),
            this.destinationPath('events/initTable.json'),
            {
                fields: null,
                typeName: "inittable",
                typeQuery: "initTable"
            }
        )
        this.fs.copyTpl(
            this.templatePath('testLambdas/eventMaker.ejs'),
            this.destinationPath('events/dropTables.json'),
            {
                fields: null,
                typeName: "droptable",
                typeQuery: "dropTables"
            }
        )

        // Adding README

        this.fs.copyTpl(
            this.templatePath('testLambdas/template.yaml'),
            this.destinationPath('template.yaml'),
            {
                appName: formatName(this.answers.name)
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

        // Adding launch.json file for sam configuration
        this.fs.copyTpl(
            this.templatePath('samConfiguration/launch.json'),
            this.destinationPath('./.vscode/launch.json')
        )

        this.add_entities = []
        this.update_entities = []
        this.delete_entities = []
        if (this.override == true) {
            this.old_schema = JSON.parse(this.file_old_json)
            this.new_schema = this.schemaJSON
            let arr = compareSchema(this.old_schema, this.new_schema)
            arr[0].forEach(x => this.add_entities.push(findTable(this.tables, x)))
            this.update_entities = arr[1]
            this.delete_entities = arr[2]
            this.add_fields = []
            // console.log("ADD ENTITIES - ", this.add_entities)
            // console.log("DELETE ENTITIES - ", this.delete_entities)
            // console.log("UPDATE : ", this.update_entities)
            this.update_entities[0].forEach(add => {
                if (add.length > 0) {
                    add.forEach(x => {
                        let table = findTable(this.tables, x.name)
                        let name = x.column.name
                        let sqlname = getSQLTableName(x.name)
                        let type = x.column.type
                        if (type !== "String" && type !== "ID" && type !== "Int" && type != "Boolean"
                            && type !== "DateTime" && type !== "Date" && type !== "Time" && type !== "URL") {
                            name = "Fk_" + type + "_id"
                        }
                        this.add_fields.push({
                            name: x.name,
                            sqlname: sqlname,
                            column: findField(table.columns, name)
                        })

                    })
                }
            })
            this.update_fields = []
            this.update_entities[1].forEach(up => {
                if (up.length > 0) {
                    up.forEach(x => {// TODO change x to match sql table names
                        this.update_fields.push(x)
                    })
                }
            })
            this.delete_fields = []
            this.update_entities[2].forEach(del => {
                if (del.length > 0) {
                    del.forEach(x => {// TODO change x to match sql table names
                        this.delete_fields.push(x)
                    })
                }
            })
            // console.log("ADD FIELDS - ", this.add_fields)
            // console.log("UPDATE FIELDS - ", this.update_fields)
            // console.log("DELETE FIELDS - ", this.delete_fields)
            this.fs.copyTpl(
                this.templatePath('upgradeDatabase/upgradeDatabase.ejs'),
                this.destinationPath('upgradeDatabase/upgradeDatabase.js'),
                {
                    tables: this.tables,
                    add_entities: this.add_entities,
                    delete_fields: this.delete_fields,
                    add_fields: this.add_fields,
                    update_fields: this.update_fields
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
        // todo : Do we really need pg ? rds-data dependancy should be removed by using RDSDataService
        this.npmInstall(['graphql', 'aws-sdk', 'pg', 'rds-data', 'chance', 'validator', 'graphql-scalars'])
    }

    // Called last, cleanup, say good bye, etc
    end() {
        this.log("Done, now use the terraform commands writtent in README.md to deploy your lambdas")
    }

}

