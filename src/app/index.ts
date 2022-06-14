import {
    Scalars,
    schemaParser,
    Relationships,
    isBasicScalar,
    isScalar,
    getSQLTableName,
    matchString,
    formatName,
    findTable,
    findField,
    getFieldsParsedHandler,
    getFieldsCreate,
    getFieldsName,
    getFieldsDirectiveNames,
    getRequire,
    getGraphqlType,
    getEnumValues,
    getAllTables,
    getInitEachFieldsModelsJS,
    getRelations,
    getJoinTables,
    getQuerySelfJoinOne,
    getQuerySelfJoinMany,
    compareSchema, typesGenerator, Type, isPersonalizedScalar
} from "easygraphql-parser-gamechanger";
import UnhandledGraphqlTypeError from "./templates/error/unhandled-graphql-type.error";
import {exec} from "child_process";
import * as util from "util";

const Generator = require('yeoman-generator');
const pluralize = require('pluralize')

const manageScalars = {
    isBasicScalar,
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
        this.log("Please answer these information to set up your project")
        this.answers = await this._askProjectProperties()

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

            if (this.override.value) {
                this.override = true
                this.file_old_json = this.fs.read(this.answers.name + '/schema.json')
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
        if (this.options.graphqlFile && this.options.graphqlFile.includes('.graphql')) {
            this.log("Fetching schema from " + this.options.graphqlFile)
            this.schema = this.fs.read(this.options.graphqlFile)

            // Parsing as a JSON object
            this.schemaJSON = schemaParser(this.schema)
            this.log('Type Generation started : LE SCHEMA')//, util.inspect(this.schemaJSON, false, null, true))

            this.types = typesGenerator(this.schemaJSON)

        } else {
            this.log("Invalid graphql schema")
            return 0
        }
    }

    // If the method name doesn’t match a priority, it will be pushed to this group.
    default() {
        this.log("Default")
    }

    // Where you write the generator specific files (routes, controllers, etc)
    writing() {
        this.log("Writing")
        // Move the root directory to perform the scaffolding
        this.destinationRoot(this.options.appName)
        this.fs.writeJSON("schema.json", this.schemaJSON)

        // All the potential types linked by interface
        this.typesInterface = []

        // Will hold all the interfaces that each type depends on (0 to N)
        this.interfaces = null

        // Get all the relations between entities
        this.types = getRelations(this.types)
        // Get all the name of join relation table
        this.joinTables = getJoinTables(this.types)

        // Will hold all the information on the tables
        this.tables = getAllTables(this.types)

        // Adding the junction table if some exeits
        this.tables.push(...this.joinTables);

        this.fs.copyTpl(
            this.templatePath('database/sqlUtils.ejs'),
            this.destinationPath('database/sqlUtils.js'),
            {
                tables: this.tables
            }
        )

        const typesNameArray = this.types.map(type => type.typeName)

        for (let index = 0; index < this.types.length; index++) {
            const currentType = this.types[index] as Type
            this.log("Processing TYPE : " + currentType.typeName)
            this.log(util.inspect(currentType, false, null, true))
            // Get the const require
            const requireTypes = getRequire(currentType)
            console.log("require types: ", requireTypes)
            // Get the graphqlType
            const graphqlType = getGraphqlType(currentType)
            console.log("graphql type : ", graphqlType)

            // Create File with directives by type
            if (index == 0) {
                this._createFileWithDirectivesByType(currentType);
            }

            if (graphqlType === "GraphQLInterfaceType") {
                this._processGraphQLInterfaceType(currentType, requireTypes);
            } else if (graphqlType === "GraphQLEnumType") {
                this._processGraphQLEnumType(currentType);
            } else if (graphqlType === "GraphQLScalarType") {
                this._processGraphQLScalarType(currentType);
            } else if (graphqlType === "GraphQLObjectType") {  // Should be GraphQLObjectType
                this._processGraphQLObjectType(currentType, typesNameArray, requireTypes);
            } else {
                throw new UnhandledGraphqlTypeError(graphqlType);
            }

            this.log("\n")
        }

        // Check if mutation and query type files already exists and add a default one if not
        if (!this.fs.exists(this.answers.name + "/graphql/types/mutation.js")) {
            this.log("Mutation file not present")
            this._createMutationFile();
        }

        if (!this.fs.exists(this.answers.name + "/graphql/types/query.js")) {
            this.log("query file not present")
            this._createQueryFile(typesNameArray);
        }

        // Adding the rootQuery Graphql Schema
        this.fs.copyTpl(
            this.templatePath('graphql/schema.ejs'),
            this.destinationPath('graphql/schema.js'),
            {typesInterface: this.typesInterface}
        )

        //Adding personalized scalar mapping
        this.fs.copyTpl(
            this.templatePath('graphql/defaultScalarsMap.ejs'),
            this.destinationPath('graphql/defaultScalarsMap.js'),
        )


        //Adding the handler.js file (main handler)
        this.fs.copyTpl(
            this.templatePath('database/globalHandler.ejs'),
            this.destinationPath('database/handler.js'),
            {tables: this.tables}
        )

        //Adding database utils file
        this.fs.copyTpl(
            this.templatePath('database/utils.ejs'),
            this.destinationPath('database/utils/index.js'),
        )

        //Adding RuntimeDirectiveResolver
        this.fs.copyTpl(
            this.templatePath('graphql/runtimeDirectiveResolver.ejs'),
            this.destinationPath('database/utils/runtimeDirectiveResolver.js'),
        )
        // Entry point of the lambdas function for index.js
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

        /** Adding initDatabase Files **/
        // Adding the file for each model
        this.fs.copyTpl(
            this.templatePath('initDatabase/models.ejs'),
            this.destinationPath('initDatabase/models.js'),
            {
                types: this.types,
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
                matchString,
                tables: this.tables,
                initEachFieldsModelsJS: getInitEachFieldsModelsJS(this.types),
            }
        )

        /** Adding clean Database Files **/
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

        /** Adding exist Database Files **/
        // Adding the file which check if all tables exists in database
        this.fs.copyTpl(
            this.templatePath('existTable/existTable.ejs'),
            this.destinationPath('existTable/existTable.js'),
            {
                tables: this.tables
            }
        )

        /** Adding Terraform Files **/
        //Adding file for API Gateway
        this.fs.copyTpl(
            this.templatePath('terraform/apigateway.tf'),
            this.destinationPath('terraform/apigateway.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )
        //Adding file for Cognito
        this.fs.copyTpl(
            this.templatePath('terraform/cognito.tf'),
            this.destinationPath('terraform/cognito.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )
        //Adding file for IAM
        this.fs.copyTpl(
            this.templatePath('terraform/iam.tf'),
            this.destinationPath('terraform/iam.tf'),
            {
                appName: formatName(this.answers.name)
            }
        )
        //Adding file for Lambdas
        this.fs.copyTpl(
            this.templatePath('terraform/lambda.tf'),
            this.destinationPath('terraform/lambda.tf'),
        )
        //Adding file for the main
        this.fs.copyTpl(
            this.templatePath('terraform/main.tf'),
            this.destinationPath('terraform/main.tf'),
        )
        //Adding file for RDS
        this.fs.copyTpl(
            this.templatePath('terraform/rds.tf'),
            this.destinationPath('terraform/rds.tf'),
        )
        //Adding file for secret
        this.fs.copyTpl(
            this.templatePath('terraform/secret.tf'),
            this.destinationPath('terraform/secret.tf'),
        )
        //Adding file for variables
        this.fs.copyTpl(
            this.templatePath('terraform/variables.tf'),
            this.destinationPath('terraform/variables.tf'),
        )
        //Adding terraform.tfvar file
        this.fs.copyTpl(
            this.templatePath('terraform/terraform.tfvar'),
            this.destinationPath('terraform/terraform.tfvar'),
            {
                appName: formatName(this.answers.name)
            }
        )
        /** Adding lambda local test dependencies **/
        this.fs.copyTpl(
            this.templatePath('testLambdas/template.yaml'),
            this.destinationPath('template.yaml'),
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

        // Adding launch.json file for sam configuration
        this.fs.copyTpl(
            this.templatePath('samConfiguration/launch.json'),
            this.destinationPath('./.vscode/launch.json')
        )

        /** Adding README file **/
        this.fs.copyTpl(
            this.templatePath('readmes/README.md'),
            this.destinationPath('README.md'),
            {
                appName: formatName(this.answers.name)
            }
        )
        /** Adding package.json file **/
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
    }

// Where conflicts are handled (used internally)
    conflicts() {
        this.log("Conflicts")
    }

    // Where installations are run (npm, bower)
    install() {
        this.log("Install")
        // todo : Do we really need pg ? rds-data dependancy should be removed by using RDSDataService
        this.npmInstall(['graphql', 'pg', 'rds-data', 'chance', 'validator', 'graphql-scalars'])
        this.npmInstall(['aws-sdk', 'prettier'], {'save-dev': true});
        exec("prettier --write .")
    }

    // Called last, cleanup, say good bye, etc
    end() {
        this.log("Done, now use the terraform commands writtent in README.md to deploy your lambdas")
    }

    // PRIVATE SECTION

    private _createMutationFile() {
        this.fs.copyTpl(
            this.templatePath('graphql/mutation.ejs'),
            this.destinationPath('graphql/types/mutation.js'),
            {
                types: this.types,
                isPersonalizedScalar,
                isScalar
            }
        )
    }

    private _createQueryFile(typesNameArray) {
        this.fs.copyTpl(
            this.templatePath('graphql/query.ejs'),
            this.destinationPath('graphql/types/query.js'),
            {
                typesName: typesNameArray,
                pluralize,
                isScalar
            }
        )
    }

    private _createFileWithDirectivesByType(currentType) {
        this.fs.copyTpl(
            this.templatePath('graphql/directives/directivesOnTypes.ejs'),
            this.destinationPath('directives/directivesOnTypes.js'),
            {
                types: this.types,
                fields: currentType.fields,
            }
        )
    }

    private async _askProjectProperties() {
        return this.prompt([
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
        ]);
    }

    private _processGraphQLObjectType(currentType, typesNameArray, requireTypes: string) {
        // Check if it implements an interface (array non empty)
        if (currentType.implementedTypes[0]) {
            // Check if this.typesInterface is already initialised
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
            this._createQueryFile(typesNameArray)
        } else if (currentType.typeName === "Mutation") {
            this._createMutationFile()
        } else {
            this.fs.copyTpl(
                this.templatePath('graphql/type.ejs'),
                this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
                {
                    type: currentType,
                    graphqlType: "GraphQLObjectType",
                    interfaces: this.interfaces,
                    typeRequire: requireTypes,
                    isPersonalizedScalar
                },
            )
        }
        // Reset this.interface array for the next object
        this.interfaces = null

        // No need for a queryType handler
        if (currentType.isNotOperation()) {
            const directiveNames = getFieldsDirectiveNames(currentType)
            let queryManyToMany = `SELECT *
                                   FROM ${currentType.sqlTypeName}
                                            INNER JOIN "'+args.tableJunction+'" ON Pk_${currentType.sqlTypeName}_id = "'+args.tableJunction+'".${currentType.sqlTypeName}_id INNER JOIN "'+parentTypeName+'"
                                   ON Pk_'+parentTypeName+'_id = "'+args.tableJunction+'".'+parentTypeName+'_id
                                   WHERE Pk_'+parentTypeName+'_id = $1`
            let queryOneToMany = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"Pk_" + currentType.sqlTypeName + "_id\" = (SELECT \"Fk_" + currentType.sqlTypeName + "_id\" FROM \"'+parentTypeName+'\" WHERE \"'+parentTypeName+'\".\"Pk_'+parentTypeName+'_id\" = $1)"
            let queryManyToOne = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + currentType.sqlTypeName + "\".\"Fk_'+parentTypeName+'_id\" = $1 '+limit+' '+offset"
            // One To One queries
            // Parent
            let queryOneToOneParent = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + currentType.sqlTypeName + "\".\"Pk_" + currentType.sqlTypeName + "_id\" = $1"
            // Child
            let queryOneToOneChild = "SELECT * FROM \"" + currentType.sqlTypeName + "\" WHERE \"" + currentType.sqlTypeName + "\".\"Fk_'+parentTypeName+'_id\" = $1"

            // Adding the handlerType.js file
            this.fs.copyTpl(
                this.templatePath('database/typeHandler.ejs'),
                this.destinationPath('database/handlers/handler' + currentType.typeName + '.js'),
                {
                    currentType: currentType,
                    typeFieldsParsed: getFieldsParsedHandler(currentType.typeName, currentType.fields),
                    queryManyToMany: queryManyToMany,
                    queryOneToMany: queryOneToMany,
                    queryOneToOneParent: queryOneToOneParent,
                    queryOneToOneChild: queryOneToOneChild,
                    queryManyToOne: queryManyToOne,
                    querySelfJoinOne: currentType.fields.find(field => field.relationship === "selfJoinOne") ? getQuerySelfJoinOne(currentType.typeName, currentType.fields) : false,
                    querySelfJoinMany: currentType.fields.find(field => field.relationship === "selfJoinMany") ? getQuerySelfJoinMany(currentType.typeName, currentType.fields) : false,
                    fields: currentType.fields,
                    relations: Relationships,
                    scalars: Scalars,
                    fieldsCreate: getFieldsCreate(currentType.typeName, currentType.fields, Relationships),
                    fieldsName: getFieldsName(currentType.fields, currentType.typeName, currentType.sqlTypeName, Relationships),
                    getSQLTableName: getSQLTableName,
                    manageScalars: manageScalars
                }
            )


            //Adding DirectiveResolvers
            this.fs.copyTpl(
                this.templatePath('graphql/directives/directiveResolvers.ejs'),
                this.destinationPath('database/utils/' + currentType.typeName.toLocaleLowerCase() + 'DirectiveResolvers.js'),
                {
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
                    typeQuery: "update"
                }
            )


        }
    }

    private _processGraphQLScalarType(currentType) {
        if (!isPersonalizedScalar(currentType.typeName)) {
            this.fs.copyTpl(
                this.templatePath('graphql/typeScalar.ejs'),
                this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
            )
        }
    }

    private _processGraphQLEnumType(currentType) {
        this.fs.copyTpl(
            this.templatePath('graphql/typeEnum.ejs'),
            this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
            {
                enumName: currentType.typeName,
                enumValues: getEnumValues(currentType),

            }
        )
        this.log("Content created for enum")
    }

    private _processGraphQLInterfaceType(currentType, requireTypes: string) {
        // Check if this.typesInterface is already initialised
        this.typesInterface.push(currentType.typeName + "Type")

        // Adding the types graphql files
        this.fs.copyTpl(
            this.templatePath('graphql/type.ejs'),
            this.destinationPath('graphql/types/' + currentType.typeName.toLowerCase() + '.js'),
            {
                type: currentType,
                graphqlType: "GraphQLInterfaceType", //EnumType, ObjectType, InterfaceType
                interfaces: null, // An interface doesn't implement other interface
                typeRequire: requireTypes,
            }
        )
    }

}

