const matching = require('./matching')
const pluralize = require('pluralize')
const camelCase = require('camelcase');

const scalars = require('./scalars/scalars')
const relationships = require('./templates/database/relationships')

const manageScalars = require('./scalars/manageScalars')

const utils = require('./templates/database/utils');
/**
 * From the schema, fetch all the types object and return an array of it
 * @param {*} schemaJSON 
 * @returns 
 */
const getAllTypes = (schemaJSON) => {
    let types = []
    for (const type in schemaJSON) {
        types.push(schemaJSON[type])
        schemaJSON[type]["typeName"] = type
        schemaJSON[type]["sqlTypeName"] = utils.getSQLTableName(type)
    }
    return types
}

// Get all directive names from the fields of a type object
const getFieldsDirectiveNames = (type) => {
    let directiveNames = []
    if (type.directives.length > 0) {
        type.directives.forEach(directive => {
            directiveNames.push(directive.name)
        })
    }

    type.fields.forEach(field => {
        if (field.directives.length > 0) {
            field.directives.forEach(directive => {
                directiveNames.push(directive.name)
            })
        }
    })
    return directiveNames
}

/** GRAPHQL files parsing */
/**
 * From the fields object, transform the syntax to get the right one to print on final type.js file. Return a string
 * @param {*} currentTypeName 
 * @param {*} fields 
 * @param {*} type 
 * @param {*} relations 
 * @param {*} manyToManyTables 
 * @param {*} typesName 
 * @param {*} defaultScalarsType 
 * @returns 
 */
const getFieldsParsed = (type, relations, manyToManyTables, typesName, defaultScalarsType) => {
    let result = ""
    for (let index = 0; index < type.fields.length; index++) {
        let field = type.fields[index]
        let hasArguments = field.arguments[0] ? true : false
        if (index > 0) 
            result += "\t\t"
        
        switch (field.type) {

            case "ID":
                if (type.typeName === "Mutation" || type.typeName === "Query" || type.typeName === "Subscription") {
                    result += buildTypeField(field, "GraphQLID", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                } else {
                    result += buildTypeField(field, "GraphQLID", false)
                }
                break

            case "String":
                if (type.typeName === "Mutation" || type.typeName === "Query" || type.typeName === "Subscription") {
                    result += buildTypeField(field, "GraphQLString", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                } else {
                    result += buildTypeField(field, "GraphQLString", false)
                }
                break

            case "Int":
                if (type.typeName === "Mutation" || type.typeName === "Query" || type.typeName === "Subscription") {
                    result += buildTypeField(field, "GraphQLInt", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                } else {
                    result += buildTypeField(field, "GraphQLInt", false)
                }
                break

            case "Boolean":
                if (type.typeName === "Mutation" || type.typeName === "Query" || type.typeName === "Subscription") {
                    result += buildTypeField(field, "GraphQLBoolean", true)
                    result += "\n"
                    result += buildArgs(field.arguments, hasArguments)
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                    result += "\n\t\t},\n"
                } else {
                    result += buildTypeField(field, "GraphQLBoolean", false)
                }
                break

                // Not classic scalar type
            default:
                if (type.typeName === "Query") { // If query, we do not accept reserved field query (e.g <entity> or <entities>)
                    if (isValidFieldQuery(field.name, typesName)) {
                        if (field.type === "String" || field.type === "Int" || field.type === "Boolean" || field.type === "ID" || defaultScalarsType.includes(field.type)) 
                            result += buildTypeField(field, field.type, true)
                         else 
                            result += buildTypeField(field, field.type + "Type", true)
                         result += "\n"
                        result += buildArgs(field.arguments, hasArguments)
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                        result += "\n\t\t},\n"
                    }
                } else if (type.typeName === "Mutation") {
                    if (isValidFieldMutation(field.name, typesName)) {
                        if (field.type === "String" || field.type === "Int" || field.type === "Boolean" || field.type === "ID" || defaultScalarsType.includes(field.type)) 
                            result += buildTypeField(field, field.type, true)
                         else 
                            result += buildTypeField(field, field.type + "Type", true)
                         result += "\n"
                        result += buildArgs(field.arguments, hasArguments)
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\t // To define \n\t\t\t}"
                        result += "\n\t\t},\n"
                    }
                } else {
                    if (defaultScalarsType.includes(field.type)) {
                        result += buildTypeField(field, field.type, true)
                        result += "\n"
                        result += buildResolver(field)
                        result += "\n\t\t},\n"
                    } else { // If it's an interface, different based resolver
                        if (type === "InterfaceTypeDefinition") {
                            result += buildResolverInterface()
                        } else {
                            result += buildTypeField(field, field.type + "Type", true)
                            result += "\n"
                            result += buildArgs(field.arguments, hasArguments)

                            // get the relation
                            let relationsBetween = field.relationType//getRelationBetween(field.type, type.typeName, relations)
                            if (relationsBetween === "manyToMany") {
                                let manyToManyTable = getManyToManyTableBetween(type.typeName, field.type, manyToManyTables)

                                result += buildResolver(field, hasArguments, type.typeName, relationsBetween, manyToManyTable)
                            } else {
                                result += buildResolver(field, hasArguments, type.typeName, relationsBetween, null)
                            }

                        } result += "\n\t\t},\n"
                    }
                }
        }
    }
    return result
}

const getFieldsInput = (fields) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        let field = fields[index]
        let hasArguments = field.arguments[0] ? true : false
        if (index > 0) 
            result += "\t\t"
        
        switch (field.type) {

            case "ID": result += buildTypeField(field, "GraphQLID", false)
                break

            case "String": result += buildTypeField(field, "GraphQLString", false)
                break

            case "Int": result += buildTypeField(field, "GraphQLInt", false)
                break

            case "Boolean": result += buildTypeField(field, "GraphQLBoolean", false)
                break

                // Not classic scalar type
            default:
                if (field.isArray) {
                    result += buildTypeField(field, field.type + "UpdateInput", false)
                } else {
                    result += field.name + ": { type: GraphQLID },\n"
                }
        }
    }
    return result


}

const isValidFieldQuery = (fieldName, typesName) => {
    let res = true
    typesName.map(typeName => {
        if (fieldName === typeName || fieldName === pluralize.plural(typeName) || fieldName === typeName.toLowerCase() || fieldName === pluralize.plural(typeName.toLowerCase())) {
            res = false
        }
    })
    return res
}

const isValidFieldMutation = (fieldName, typesName) => {
    let res = true
    typesName.map(typeName => {
        if (fieldName === typeName + "Create" || fieldName === typeName + "Update" || fieldName === typeName + "Delete") {
            res = false
        }
    })
    return res
}

// Construct the types, return a string
const buildTypeField = (field, type, needResolved) => {
    let result = needResolved ? field.name + ": { \n\t\t\ttype: " : field.name + ": { type: "
    let parentheses = ""
    if (field.isArray) {
        if (field.noNull) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += "new GraphQLList("
        parentheses += ")"
        if (field.noNullArrayValues) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += type
    } else {
        if (field.noNull) {
            result += "new GraphQLNonNull("
            parentheses += ")"
        }
        result += type
    } result += needResolved ? parentheses + "," : parentheses + " },\n"
    return result
}

// Construct the arguments, return a string
const buildArgs = (arguments, hasArguments) => {
    let result = ""
    if (hasArguments) {
        result += "\t\t\targs: {\n"
        arguments.forEach(argument => {
            result += "\t\t\t\t"
            switch (argument.type) {
                case "ID": result += buildTypeField(argument, "GraphQLID")
                    break
                case "String": result += buildTypeField(argument, "GraphQLString")
                    break
                case "Int": result += buildTypeField(argument, "GraphQLInt")
                    break
                default: result += buildTypeField(argument, argument.type + "Type")
                    break
            }
            // result += ",\n"
        })
        result += "\t\t\t},\n"
    }
    return result
}

// Construct the resolver based on the type field, return a string
const buildResolver = (field, hasArguments = false, currentTypeName, relationType = null, manyToManyTable = null, scalarTypeNames = []) => {
    let result = ""
    if (hasArguments) {
        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet(args, '" + field.type + "Type')\n\t\t\t}"
    } else {
        if (currentTypeName !== "Query") {
            if (manyToManyTable != null) {
                result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: \"" + relationType + "\", tableJunction: \"" + manyToManyTable.sqlname + "\"}, '" + field.type + "Type')\n\t\t\t}"
            } else {
                if (!relationType) { // TODO check if other scalar type need casting from being fetch from postgres table
                    if (field.type === "DateTime" || field.type === "Date" || field.type === "Date") {
                        result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn new Date(obj." + field.name + ")\n\t\t\t}" // Cast into a Date object
                    }
                } else {
                    result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\tlet result = dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: \"" + relationType + "\"}, '" + field.type + "Type').then((data) => {\n\t\t\t\treturn data\n\t\t\t})\n\t\t\treturn result\n\t\t\t}"
                }
            }
        } else {
            result += "\t\t\tresolve: (obj, args, context, info) => {\n\t\t\t\treturn dbHandler.handleGet(null, '" + field.type + "Type')\n\t\t\t}"
        }
    }
    return result
}

// Construct the resolver for interface
const buildResolverInterface = () => {
    let result = ""
    result += "\t\t\tresolve: (obj, args, context) => {\n\t\t\t\treturn resolveType(args)\n\t\t\t}"
    return result
}

// Get all the types required, except the current one, to import in file
const getRequireTypes = (currentType, defaultScalars) => {
    let result = []
    currentType.fields.forEach(field => {
        let type = field.type
        if (type !== currentType) {
            if (type !== "String" && type !== "ID" && type !== "Int" && type != "Boolean") { // If it's a predefined scalars no need to include it
                if (!defaultScalars.includes(type)) { // Check if it's not already included (multiple type call in Query)
                    if (! result.includes(type)) 
                        result.push(type)
                }
            }
        }
        // Checking internal argument (for the query mainly if there's enum in place)
        field.arguments.forEach(argument => {
            if (argument.type !== currentType) {
                if (argument.type !== "String" && argument.type !== "ID" && argument.type !== "Int" && argument.type != "Boolean") { // Check if it's not already included (multiple type call in Query)
                    if (! result.includes(argument.type)) 
                        result.push(argument.type)
                }
            }
        })
    })
    return result
}

// Build the require const type string
const getRequire = (type, defaultScalars) => {
    const requiredTypes = getRequireTypes(type, defaultScalars)
    let result = ""
    for (let index = 0; index < requiredTypes.length; index++) {
        if (!defaultScalars.includes(requiredTypes[index])) {
            result += "const " + requiredTypes[index] + "Type = require('./" + requiredTypes[index].toLowerCase() + "')\n"
            // result += "const " + requiredTypes[index] + "UpdateInput = require('./" + requiredTypes[index].toLowerCase() + "UpdateInput')\n"
        }
    }
    return result
}

// Handle the different graphql type and return the correct one
const getGraphqlType = (type) => {
    switch (type.type) {
        case "EnumTypeDefinition":
            return "GraphQLEnumType"
        case "InterfaceTypeDefinition":
            return "GraphQLInterfaceType"
        case "ObjectTypeDefinition":
            return "GraphQLObjectType"
        case "ScalarTypeDefinition":
            return "GraphQLScalarType"
    }
}

const getResolveType = (type, currentTypeName) => {
    let result = ""
    let implementedTypes = type.implementedTypes

    implementedTypes.forEach(implementedType => {
        result += "\t\t\tcase \"" + implementedType + "\":\n"
        result += "\t\t\t\treturn " + implementedType + "Type\n"
    });
    result += "\t\t\tdefault: \n\t\t\t\treturn " + currentTypeName + "Type"

    return result
}

const getEnumValues = (currentType) => {
    let result = ""
    let integerValue = 0
    currentType.values.forEach(value => {
        result += value + ": {\n\tvalue: " + integerValue + "\n},"
        integerValue++
    })
    return result
}

/** TYPE HANDLER */

const getFieldsParsedHandler = (currentTypeName, fields, isOneToOneChild, parent) => {
    let result = ""
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].name === "id") {
            if (!isOneToOneChild) 
                result += "\t\t\t" + fields[index].name + ": data.Pk_" + currentTypeName + "_id"
             else 
                result += "\t\t\t" + fields[index].name + ": data.Pk_" + parent + "_id"
            
        } else {
            result += "\t\t\t" + fields[index].name + ": data." + fields[index].name
        }
        if (index < fields.length - 1) 
            result += ","
        
        result += "\n"
    }
    return result
}


const getFieldsCreate = (currentTypeName, fields, relations, manyToManyTables) => {
    let sqlFields = []
    // Deal with scalar first (removing any Array)
    fields.filter(field => !field.isArray).forEach(field => {
        let sqlField = manageScalars.getFieldCreate(field.type, field.name)
        if (sqlField) 
            sqlFields.push(sqlField);
        
    })
    // Deal with oneOnly relationship
    fields.filter(field1 => field1.relationType == relations.oneOnly).forEach(field2 => {
        sqlFields.push(`args.${
            field2.name
        }`);
    })
    
    return sqlFields.filter(field => !field.includes("args.id")).join(` + "," + `);
}

const getFieldsName = (tables, fields, currentTypeName, currentSQLTypeName, relations) => {
    let sqlNames = []
    // Deal with scalar first (removing any Array)
    fields.filter(field => !field.isArray).forEach(field => {
        let sqlName = manageScalars.getFieldName(field.type, field.name, currentTypeName)
        if (sqlName) 
            sqlNames.push(sqlName);
        
    })
    // Deal with oneOnly relationship

    fields.filter(field1 => field1.relationType == relations.oneOnly).forEach(field2 => {
        sqlNames.push("\\\"" + utils.getSQLTableName(field2.foreign_key.name) + "\\\"");
    })

    return sqlNames.filter(field => !field.includes("\"Pk_")).join(",");
}

const getDeleteMethodsMany = (currentTypeName, fields, relations, manyToManyTables) => {
    let s = ''
    fields.forEach(field => {
        if (field.type !== "ID" && field.type !== "String" && field.type !== "Int" && field.type !== "Boolean") {
            if (isManyToMany(currentTypeName, field.type, relations.manyToMany)) {
                s += '// Type ' + field.type + '\n'
                let manyToManyTable = getManyToManyTableBetween(currentTypeName, field.type, manyToManyTables).name
                s += 'sqlParams.sql = \"SELECT * FROM \\\"' + field.type + '\\\" INNER JOIN \\\"' + manyToManyTable + '\\\" ON \\\"Pk_' + field.type + '_id\\\" = \\\"' + manyToManyTable + '\\\".\\\"' + field.type + '_id\\\" INNER JOIN \\\"' + currentTypeName + '\\\" ON \\\"Pk_' + currentTypeName + '_id\\\" = \\\"' + manyToManyTable + '\\\".\\\"' + currentTypeName + '_id\\\" WHERE \\\"Pk_' + currentTypeName + '_id\\\" = " + id\n'
                s += 'rdsDataService.executeStatement(sqlParams, (err, data) => {\n'
                s += 'if (err) { console.log(err, err.stack) }\n'
                s += `else {
                 			let current` + field.type + `State = utils.constructOutputArray(data, "` + field.type + `")
                 			let removedElements` + field.type + ` = utils.getRemovedElements(current` + field.type + `State, [])
                 			for (let index = 0; index < removedElements` + field.type + `.length; index++) {
                 				sqlParams.sql = "DELETE FROM \\\"` + manyToManyTable + `\\\" WHERE \\\"` + field.type + `_id\\\" = " + removedElements` + field.type + `[index] + " AND \\\"` + currentTypeName + `_id\\\" = " + id
                 				rdsDataService.executeStatement(sqlParams, (err, data) => {
                 					if (err) console.log(err, err.stack);
                 					else console.log(data);
                 				})
                 			}
                         }\n`
                s += '})\n\n'
            }
        }
    })

    return s
}


/** DATABASE (tables, init, fill, drop) */

// Tables
// Get all the tables, with columns, based on the types we have
const getAllTables = (types, scalarTypeNames) => {
    let allTables = []
    let typesNameArray = types.map(type => type.typeName)
    types.forEach(type => {
        let tableTemp = []
        // Fill up the infos on scalar field (int, string, etc.)
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.typeName !== "Subscription"  && !scalarTypeNames.includes(type.typeName)) {
            //get scalar field infos
            tableTemp.push(...manageScalars.getScalarFieldInfo(type, typesNameArray)) 
            /*
            let rfields = getRelationalFields(type.fields, scalarTypeNames)
            rfields.forEach(rfield => {
                switch(rfield.relationType) {
                    case "oneOnly":
                        tableTemp.push({
                            field: "Fk_" + type.sqlTypeName + "_id",
                            fieldType: "Int",
                            noNull: fieldChild.noNull,
                            unique: false,
                            constraint: "FOREIGN KEY (\"Fk_" + type.sqlTypeName + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"
                        })
                        break

                        case "manyOnly":
                            // Only if the current type DOES NOT have the field type
                            if (!hasFieldType(currentType, type.sqlTypeName).answers) { // We create a column reference that can hold id of element from the fieldType, but without constraint since it's just informative
                                tableTemp.push({
                                    field: "Fk_" + type.sqlTypeName + "_id",
                                    fieldType: "Int",
                                    noNull: false,
                                    unique: false,
                                    constraint: "FOREIGN KEY (\"Fk_" + type.sqlTypeName + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"
                                })
                            }
                            break

                        case "oneToMany":
                            // Nothing, since the Fk will be placed on the other linked table
                            break

                        case "manyToOne": fieldChild = (hasFieldType(currentType, type.typeName).fieldInfo)
                            tableTemp.push({
                                field: "Fk_" + type.sqlTypeName + "_id",
                                fieldType: "Int",
                                noNull: fieldChild.noNull,
                                unique: false,
                                constraint: "FOREIGN KEY (\"Fk_" + type.sqlTypeName + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + sqlttype.sqlTypeNameypeTable + "_id\")"
                            })
                            break

                        case "manyToMany":
                            // Nothing, since the junction tables will hold the id necessary
                            break

                        case "oneToOneParent": fieldChild = (hasFieldType(currentType, type.typeName).fieldInfo)
                            if (fieldChild.noNull) {
                                tableTemp.push({
                                    field: "Fk_" + type.sqlTypeName + "_id",
                                    fieldType: "Int",
                                    noNull: fieldChild.noNull,
                                    unique: true,
                                    constraint: "FOREIGN KEY (\"Fk_" + type.sqlTypeName + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"
                                })
                            } else { // Nothing, it's unidirectionnal and the constraint is on the child
                            }
                            break

                        case "oneToOneChild": fieldChild = (hasFieldType(currentType, type.typeName).fieldInfo)
                            tableTemp.push({
                                field: "Fk_" + type.sqlTypeName + "_id",
                                fieldType: "Int",
                                noNull: true,
                                unique: true,
                                constraint: "FOREIGN KEY (\"Fk_" + type.sqlTypeName + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"
                            })

                        case "selfJoinOne":
                            // Check field with the same type
                            const fields = currentType.fields
                            fields.forEach(field => { // If it's the field, we add the key
                                if (field.type === currentTypeName) { // Adding a foreign key with the graphql field name
                                    tableTemp.push({
                                        field: field.name + "_id",
                                        fieldType: "Int",
                                        noNull: field.noNull,
                                        unique: true,
                                        constraint: "FOREIGN KEY (\"" + field.name + "_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"
                                    })
                                }
                            })
                        default:
                            // No relation
                            break
                }
            })*/
            allTables.push({ name: type.typeName, sqlname: type.sqlTypeName, columns: tableTemp, isJoinTable: false })
        }
    })

    return allTables
}

const getInitEachModelsJS = (tables) => {
    let s = '';
    tables.forEach(table => {
        s += 'init' + table.name + '()\n'
    })
    return s;
}

const getInitEachModelsFields = (types) => {
    let s = '';
    types.forEach(type => {
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.typeName !== "Subscription") {
            let nameList = type.typeName.toLowerCase()
            s += 'for(let i = 0; i < ' + nameList + 'Tab.length; i++){\n\t' + nameList + 'Tab[i] = update' + type.typeName + '(' + nameList + 'Tab[i]);\n}';
        }
    })
    return s;
}

const getInitEachFieldsModelsJS = (types) => {
    let s = '';
    s += getInitEachModelsFields(types);
    s += '\n\n'
    return s;
}

// Models

const getParameters = (typesName, sqltypesName, currentType, relations, scalarTypeNames) => {
    let explicit = []
    currentType.fields.forEach(field => { // Parameters explicit
        switch (field.type) {
            case "String":
            case "ID":
            case "Boolean":
            case "Int": explicit.push(field.name.toLowerCase())
                break
            default:
                if (scalarTypeNames.includes(field.type)) {
                    explicit.push(field.name.toLowerCase())
                }
                break
        }
    })
    let result = explicit.join(',')

    // Parameters implicit
    // Then, we check relations between the current type table with all the types
    for (let index = 0; index < typesName.length; index++) {
        let relationType = ""
        currentType.fields.forEach(element => {
            if(element.type === currentType.typeName ){
                
                relationType = element.relationType
            }
        });

        //let relationType = getRelationBetween(currentType.typeName, typesName[index], relations)
        switch (relationType) {
            case "manyOnly":
                // Only if the current type DOES NOT have the field type
                if (!hasFieldType(currentType, typesName[index]).answers) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "manyToOne": result += ", "
                result += sqltypesName[index] + ""
                break

            case "manyToMany":
                // if self join many
                if (currentType.typeName === typesName[index]) {
                    const fieldsCurrentType = currentType.fields
                    fieldsCurrentType.forEach(field => { // If it's the field, we add the key
                        if (field.type === currentType.typeName) {
                            result += ", "
                            result += field.name.toLowerCase()
                        }
                    })
                } else {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += ", "
                    result += sqltypesName[index] + ""
                }
                break

            case "oneToOneChild": result += ", "
                result += sqltypesName[index] + ""
                break

            case "selfJoinOne":
                // Check field with the same type
                const fieldsCurrentType = currentType.fields
                fieldsCurrentType.forEach(field => { // If it's the field, we add the key
                    if (field.type === currentType.typeName) {
                        result += ", "
                        result += field.name.toLowerCase() + "_id"
                    }
                })
                break
            default: // No relation
                break
        }
    }
    return result
}

const getBodyOfConstructor = (typesName, sqltypesName, currentType, relations) => {
    let result = ""
    let defaultScalars = []
    for (const value in scalars) {
        defaultScalars.push(scalars[value])
    }

    currentType.fields.forEach(field => {
        switch (field.type) {
            case "String":
            case "ID":
            case "Boolean":
            case "Int": result += "\t\t\tthis." + field.name.toLowerCase() + " = " + field.name.toLowerCase() + ";\n"
                break;

            default:
                if (defaultScalars.includes(field.type)) {
                    result += "\t\t\tthis." + field.name.toLowerCase() + " = " + field.name.toLowerCase() + ";\n"
                }
                break;
        }
    })

    // Parameters implicit
    // Then, we check relations between the current type table with all the types
    for (let index = 0; index < typesName.length; index++) {
        currentType.fields.forEach(element => {
            if(element.type === currentType.typeName ){
                
                relationType = element.relationType
            }
        });
        // let relationType = getRelationBetween(currentType.typeName, typesName[index], relations)
        switch (relationType) {
            case "manyOnly":
                // Only if the current type DOES NOT have the field type
                if (!hasFieldType(currentType, typesName[index]).answers) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break
            case "oneOnly":
                // Only if the current type DOES have the field type
                if (hasFieldType(currentType, typesName[index]).answers) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break

            case "manyToOne": result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"

                break

            case "manyToMany":
                // if self join many
                if (currentType.typeName === typesName[index]) {
                    const fields = currentType.fields
                    fields.forEach(field => { // If it's the field, we add the key
                        if (field.type === currentType.typeName) {
                            result += "\t\t\tthis." + field.name.toLowerCase() + " = " + field.name.toLowerCase() + ";\n"
                        }
                    })
                } else {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }
                break

            case "oneToOneParent":
                let fieldChild = hasFieldType(currentType, typesName[index]).fieldInfo
                if (fieldChild.noNull) {
                    result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                }

                break

            case "oneToOneChild": result += "\t\t\tthis." + sqltypesName[index].toLowerCase() + " = " + sqltypesName[index].toLowerCase() + ";\n"
                break


            case "selfJoinOne":
                // Check field with the same type
                const fields = currentType.fields
                fields.forEach(field => { // If it's the field, we add the key
                    if (field.type === currentType.typeName) {
                        result += "\t\t\tthis." + field.name.toLowerCase() + "_id = " + field.name.toLowerCase() + "_id;\n"
                    }
                })
                break
            default: // No relation
                break
        }
    }

    return result
}

const getCreationOfModels = (types, relations, scalarTypeNames) => {
    let s = '';
    let typesName = types.map(type => type.typeName)
    let sqlTypesName = types.map(type => type.sqlTypeName)

    types.forEach(type => {
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.type !== "ScalarTypeDefinition") {
            s += 'class ' + type.typeName + ' {\n\tconstructor(' + getParameters(typesName, sqlTypesName, type, relations, scalarTypeNames) + '){\n';
            s += getBodyOfConstructor(typesName, sqlTypesName, type, relations);
            s += '\t}\n}\n\n'
        }
    })
    return s;
}

const getListOfModelsExport = (types) => {
    let s = [];
    types.forEach(type => {
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.type !== "ScalarTypeDefinition") {
            s.push(type.typeName + ' : ' + type.typeName)
        }
    })

    return s.join(',\n\t');
}

/** RELATIONS HANDLER */

const getRelationalFields = (fields, scalarTypeNames) => {
    const lst = fields.filter(field => field.type != "String" && field.type != "ID" && field.type != "Int" && fields.type != "Boolean" && !scalarTypeNames.includes(field.type) && field.type != "foreign_key")

    return lst;

}
/**
 * 
 * @param {*} fields Fields of the targeted object
 * @param {*} currentType Type being inspected
 * @returns 2 if relationship is [Type], 1 if relationship is Type, 0 if no relationship
 * @description Doesn't work if there is several time the same type referenced in the fileds !
 */
const getManyOrOne = (fields, currentType) => {
    for (let index = 0; index < fields.length; index++) {
        if (fields[index].type == currentType) {
            if (fields[index].isArray) {
                return 2;
            }
            return 1;
        }
    }
    return 0;
}
/**
 * 
 * @param {*} element : Target type for the relation
 * @param {*} types : Types defined in the schema
 * @param {*} typenames : Typenames defined in the schema
 * @param {*} currentType : Current Type being processed
 * @returns : 2 if relationship is [Type], 1 if relationship is Type, 0 if no relationship
 */
const getRelationOf = (element, types, typenames, currentType) => {
    for (let index = 0; index < types.length; index++) {
        if (typenames[index] == element) {
            let fields = types[index].fields
            return getManyOrOne(fields, currentType)
        }
    }
    return 0;

}

const uniqBy = (a, key) => {
    let seen = {};
    return a.filter(function (item) {
        let k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

const filter = (lst) => {
    for (let i = 0; i < lst.length; i++) {
        lst[i].sort()
    }
    return uniqBy(lst, JSON.stringify)
}

/**
 *  Compute relationships oneToMany, manyToMany, etc..
 * @param {*} types contains all types with associated attributes read from easygraphql-parser
 * @param {*} typenames names assocoated with each type
 * @param {*} scalarTypeNames scalar type name if type is one of them
 * @returns 
 */
const getRelations = (types, scalarTypeNames) => { // console.log(JSON.stringify(types,null, 3), "\n",typenames, "\n", scalarTypeNames)
    let typenames = types.map(type => type.typeName)
    let manyToMany = []
    types.forEach(type => {
        if (type.typeName != "Query" && type.typeName != "Mutation" && type.typeName != "Subscription") {
            let rfields = getRelationalFields(type.fields, scalarTypeNames)
            rfields.forEach(rfield => { // Check if it's not a scalar type
                // we skip fields that were been added by other types ( ex: ManyOnly relation)
                if( !rfield["delegated_field"]["state"]){
                    let out = getRelationOf(rfield.type, types, typenames, type.typeName)
                    let inn = getRelationOf(type.typeName, types, typenames, rfield.type)
                    if (out == 2 && inn == 2) { // Checking if self join (type related to itself)
                        if (rfield.type === type.typeName) {
                            type["relationList"].push({ "type" : rfield.type, "relation" : relationships.selfJoinMany})

                            
                            rfield["relationType"] = relationships.selfJoinMany
                            rfield["activeSide"] = true

                            // add info of jointable Associated
                            rfield["joinTable"]["state"] = true 
                            rfield["joinTable"]["name"] = type.typeName +"_" + rfield.type + "_" + rfield.name 
                            rfield["joinTable"]["contains"].push({
                                "fieldName" : rfield.name,
                                "type" : rfield.type
                            })
                            // the field wont appear in model
                            rfield["in_model"] = false


                            // No addition needed for ManyToMany --> only through join table
                        } else {
                            if (rfield.directives.length>0 && rfield.directives.filter(directive => directive.name == 'hasInverse').length >0) {
                                type["relationList"].push({ "type" : rfield.type, "relation" : relationships.manyToMany})

                                rfield["relationType"] = relationships.manyToMany
                             
                                rfield["activeSide"] = true
                                // add info of jointable Associated
                                rfield["joinTable"]["state"] = true 
                                rfield["joinTable"]["name"] = type.typeName +"_" + rfield.type + "_" + rfield.name 
                                rfield["joinTable"]["contains"].push({
                                    "fieldName" : rfield.name,
                                    "type" : rfield.type
                                })

                                // gets the related field of join table in the other side thanks to hasInverseDirective info
                                hasInverseFieldName = rfield.directives.filter(directive => directive.name == 'hasInverse')[0].args[0].value
                                // push it into joinTable info
                                rfield["joinTable"]["contains"].push({
                                    "fieldName" : hasInverseFieldName,
                                    "type" : type.typeName
                                })
                                
                                manyToMany.push({"type": type, "relationship": rfield})
                                // the field wont appear in model
                                rfield["in_model"] = false
                                // No addition needed for ManyToMany --> only through join table

                            } else {
                                // standard manyToMany tables but we try to not duplicate tables from each side of relation
                                type["relationList"].push({ "type" : rfield.type, "relation" : relationships.manyToMany})


                                rfield["relationType"] = relationships.manyToMany
                                manyToMany.push({"type": type, "relationship": rfield})
                                // the field wont appear in model
                                rfield["in_model"] = false

                                // todo : to be clarified
                            }
                        }
                    } else if (out == 2 && inn == 1) {
                        type["relationList"].push({ "type" : rfield.type, "relation" : relationships.oneToMany})


                        rfield["relationType"] = relationships.oneToMany
                        // A Fk field has to be added to the targeted object
                        let targetType = types.filter(type => type.typeName == rfield.type)
                        if (targetType.length != 1) {
                            console.error('Reference to type '+rfield.type+' found 0 or several times')
                        } else {
                            // set relation status to each side of relation
                            rfield["relation"] = true

                            // tracks the fk that were added to the targetType
                            rfield["delegated_field"]["associatedWith"]["type"] = targetType[0].typeName
                            rfield["delegated_field"]["associatedWith"]["fieldName"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id"
                            rfield["delegated_field"]["side"] = "origin"
                            


                            // copy all info from field to fk to be added in targetType
                            let delegatedField = JSON.parse(JSON.stringify(rfield))
                            // delegated field is a foreign Key
                            delegatedField["foreign_key"] = {
                                "name": "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                                "type": "Int",
                                "noNull": true,
                                "isArray": false,
                                "foreignKey": true,
                                "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+type.sqlTypeName+"_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"


                            }
                            delegatedField["delegated_field"]["state"] = true
                            delegatedField["name"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                            delegatedField["type"] = "Int"

                            // tracks the type who added the Fk
                            delegatedField["delegated_field"]["associatedWith"]["type"] = type.typeName
                            delegatedField["delegated_field"]["associatedWith"]["fieldName"] = rfield.name
                            delegatedField["delegated_field"]["side"] = "target"
                          

                            
                            // the field wont appear in model
                            rfield["in_model"] = false
                        
                            targetType[0].fields.push(delegatedField)
                              
                        }
                        

                    } else if (out == 1 && inn == 2) {
                        type["relationList"].push({ "type" : rfield.type, "relation" : relationships.manyToOne})


                        rfield["relationType"] = relationships.manyToOne
                        // a Fk field has to be added to the current object
                    
                        let targetType = types.filter(type => type.typeName == rfield.type)
                        rfield["relation"] = true

                        // tracks the fk that were added to the targetType
                        rfield["delegated_field"]["associatedWith"]["type"] = targetType[0].typeName
                        rfield["delegated_field"]["associatedWith"]["fieldName"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id"
                        rfield["delegated_field"]["side"] = "origin"
                        


                        // copy all info from field to fk to be added in targetType
                        let delegatedField = JSON.parse(JSON.stringify(rfield))
                        // delegated field is a foreign Key
                        delegatedField["foreign_key"] = {
                            "name": "Fk_"+rfield.name+"_"+utils.getSQLTableName(rfield.type)+"_id",
                            "type": "Int",
                            "noNull": true,
                            "isArray": false,
                            "foreignKey": true,
                            "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+utils.getSQLTableName(rfield.type)+"_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + utils.getSQLTableName(rfield.type) + "_id\")"
                            
                        }
                        delegatedField["delegated_field"]["state"] = true
                        delegatedField["name"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                        delegatedField["type"] = "Int"

                        // tracks the type who added the Fk
                        delegatedField["delegated_field"]["associatedWith"]["type"] = type.typeName
                        delegatedField["delegated_field"]["associatedWith"]["fieldName"] = rfield.name
                        delegatedField["delegated_field"]["side"] = "target"
                    

                        
                        // the field wont appear in model
                        rfield["in_model"] = false
                    
                        targetType[0].fields.push(delegatedField)


                    } else if (out == 1 && inn == 1) { 
                        // Checking if self join (type related to itself)
                        if (rfield.type === type.typeName) {
                            type["relationList"].push({ "type" : rfield.type, "relation" : relationships.selfJoinOne})


                            rfield["relationType"] = relationships.selfJoinOne
                            rfield["foreign_key"] = {
                                "name": "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                                "type": "Int",
                                "noNull": true,
                                "isArray": false,
                                "foreignKey": true,
                                "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+type.sqlTypeName+"_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"

                            }

                        } else {
                            rfield["relationType"] = relationships.oneToOne
                            // Both object has to integrate a Fk to Pk but each side is processed in each type
                            rfield["foreign_key"] = {
                                "name": "Fk_"+rfield.name+"_"+utils.getSQLTableName(rfield.type)+"_id",
                                "type": "Int",
                                "noNull": true,
                                "isArray": false,
                                "foreignKey": true,
                                "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+utils.getSQLTableName(rfield.type)+"_id\") REFERENCES \"" + utils.getSQLTableName(rfield.type) + "\" (\"Pk_" + type.sqlTypeName + "_id\")"

                                
                            }
                        }
                    }
                    // One only 
                    else if ((out == 0 && inn == 1)||(out == 1 && inn == 0)) {
                        type["relationList"].push({ "type" : rfield.type, "relation" : relationships.oneOnly})


                        rfield["relationType"] = relationships.oneOnly
                        // Fk to target Pk id has to be added in the current type
                        let targetSQLTypeName = utils.getSQLTableName(rfield.type)
                        rfield["foreign_key"] = {
                            "name": "Fk_"+rfield.name+"_"+targetSQLTypeName+"_id",
                            "type": "Int",
                            "noNull": rfield.noNull, 
                            "isArray": false,
                            "foreignKey": true,
                            "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+targetSQLTypeName+"_id\") REFERENCES \"" + targetSQLTypeName + "\" (\"Pk_" + targetSQLTypeName + "_id\")"
                        }
                    } 
                    // ManyOnly 
                    else if ((out == 0 && inn == 2) || (out == 2 && inn == 0)) {
                        type["relationList"].push({ "type" : rfield.type, "relation" : relationships.manyOnly})

                        rfield["relationType"] = relationships.manyOnly
                        // Fk to current Pk id has to be added in the targeted type
                        let targetType = types.filter(type => type.typeName == rfield.type)
                        if (targetType.length != 1) {
                            console.error('Reference to type '+rfield.type+' found 0 or several times')
                        } else {
                            // set relation status to each side of relation
                            rfield["relation"] = true

                            // tracks the fk that were added to the targetType
                            rfield["delegated_field"]["associatedWith"]["type"] = targetType[0].typeName
                            rfield["delegated_field"]["associatedWith"]["fieldName"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id"
                            rfield["delegated_field"]["side"] = "origin"


                            // copy all info from field to fk to be added in targetType
                            let delegatedField = JSON.parse(JSON.stringify(rfield))
                            // delegated field is a foreign Key
                            delegatedField["foreign_key"] ={
                                "name": "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                                "type": "Int",
                                "noNull": true,
                                "isArray": false,
                                "foreignKey": true,
                                "constraint": "FOREIGN KEY (\"Fk_"+rfield.name+"_"+type.sqlTypeName+"_id\") REFERENCES \"" + type.sqlTypeName + "\" (\"Pk_" + type.sqlTypeName + "_id\")"

                            }
                            delegatedField["delegated_field"]["state"] = true
                            delegatedField["name"] = "Fk_"+rfield.name+"_"+type.sqlTypeName+"_id",
                            delegatedField["type"] = "Int"

                            
                            
                            // tracks the type who added the Fk
                            delegatedField["delegated_field"]["associatedWith"]["type"] = type.typeName
                            delegatedField["delegated_field"]["associatedWith"]["fieldName"] = rfield.name
                            delegatedField["delegated_field"]["side"] = "target"

                            // the field wont appear in model
                            rfield["in_model"] = false
                            
                        
                            targetType[0].fields.push(delegatedField)
                            
                        }
                    } 
                    // Remove the relationship from the field : WHY ?
                    //type.fields = type.fields.filter((e) => e !== rfield)
                }
            })
        }
    })

    // Todo filter manyToMany relationship to keep only 1 active side
    for (let index1 = 0; index1< manyToMany.length; index1++) { 
        // find a reciproq relationship 
        for (let index2 = index1+1; index2<manyToMany.length; index2++) {
            if (manyToMany[index1].relationship.type == manyToMany[index2].type.typeName && manyToMany[index1].relationship.directives.length>0  && manyToMany[index1].relationship.directives.filter(directive => directive.name == 'hasInverse').length >0) {
                manyToMany[index2].relationship.activeSide = false // Todo should be reported in the type object
            }
            else{
                manyToMany[index2].relationship.activeSide = true
            }

        }
    }

    return types

}

const isManyToMany = (typeOne, typeTwo, manyToMany) => {
    let answers = false
    manyToMany.forEach(relation => {
        if (typeOne === typeTwo) {
            if (relation[0] === typeOne && relation[1] === typeTwo) {
                answers = true
            }
        } else {
            if (relation.includes(typeOne) && relation.includes(typeTwo)) 
                answers = true
            
        }
    })
    return answers
}

const isOneToMany = (typeOne, typeTwo, oneToMany) => {
    let answers = false
    oneToMany.forEach(relation => {
        if (relation[0] === typeOne && relation[1] === typeTwo) {
            answers = true
        }
    })
    return answers
}

const isManyToOne = (typeOne, typeTwo, manyToOne) => {
    let answers = false
    manyToOne.forEach(relation => {
        if (relation[0] === typeOne && relation[1] === typeTwo) {
            answers = true
        }
    })
    return answers
}

const isOneToOne = (typeOne, typeTwo, oneToOne) => {
    let answers = false
    let parent = typeTwo
    oneToOne.forEach(relation => {
        if ((relation[0] === typeOne && relation[1] === typeTwo) || (relation[1] === typeOne && relation[0] === typeTwo)) {
            answers = true
            parent = relation[1]
        }
    })
    return {answers: answers, parent: parent}
}

const isOneOnly = (typeOne, typeTwo, oneOnly) => {
    let answers = false
    oneOnly.forEach(relation => {
        if (relation.includes(typeOne) && relation.includes(typeTwo)) {
            answers = true
        }
    })
    return answers
}

const isManyOnly = (typeOne, typeTwo, manyOnly) => {
    let answers = false
    manyOnly.forEach(relation => {
        if ((relation[0] === typeOne && relation[1] === typeTwo) || (relation[1] === typeOne && relation[0] === typeTwo)) {
            answers = true
        }
    })
    return answers
}

const isSelfJoinOne = (type, selfJoinOne) => {
    let answers = false
    selfJoinOne.forEach(relation => {
        if (relation[0] === type && relation[1] === type) {
            answers = true
        }
    })
    return answers
}

const isSelfJoinMany = (type, selfJoinMany) => {
    let answers = false
    selfJoinMany.forEach(relation => {
        if (relation[0] === type && relation[1] === type) {
            answers = true
        }
    })
    return answers
}

// const getRelationBetween = (typeOne, typeTwo, relations) => {
//     if (typeOne !== "Query" && typeTwo !== "Query") {
//         if (isManyToMany(typeOne, typeTwo, relations.manyToMany)) 
//             return "manyToMany"
//          else if (isOneToMany(typeOne, typeTwo, relations.oneToMany)) 
//             return "oneToMany"
//          else if (isManyToOne(typeOne, typeTwo, relations.manyToOne)) 
//             return "manyToOne"
//          else if (isOneToOne(typeOne, typeTwo, relations.oneToOne).answers) {
//             if (typeOne === isOneToOne(typeOne, typeTwo, relations.oneToOne).parent) 
//                 return "oneToOneParent"
//              else 
//                 return "oneToOneChild"
            
//         } else if (isOneOnly(typeOne, typeTwo, relations.oneOnly)) 
//             return "oneOnly"
//          else if (isManyOnly(typeOne, typeTwo, relations.manyOnly)) 
//             return "manyOnly"
//          else if (isSelfJoinOne(typeOne, relations.selfJoinOne)) 
//             return "selfJoinOne"
//          else {
//             return "selfJoinMany"
//         }
//     } else 
//         return "No relation"
    
// }
/**
 * Build the list of join tables to add to the schema on top of standard object
 * 
 * @param {*} List of types as return by easygraphql-parser and enrich by determining relationship kinds on each field 
 * @param {*} scalarTypeNames 
 * @returns Tables description
 */
const getJoinTables = (types, scalarTypeNames) => {
    let result = []

    types.forEach(type => {
        if (type.typeName != "Query" && type.typeName != "Mutation" && type.typeName != "Subscription") {
            let rfields = getRelationalFields(type.fields, scalarTypeNames)
            rfields.filter(field => field.relationType == relationships.selfJoinMany).forEach(rfield => { 
                let elt0 = utils.getSQLTableName(type.typeName)
                let elt1 = utils.getSQLTableName(rfield.type.toLowerCase())
                result.push({
                    name: type.typeName + "_" + rfield.type.toLowerCase()+ "_" + rfield.name,
                    sqlname: elt0 + "_" + elt1 + "_" + rfield.name.toLowerCase(),
                    isJoinTable: true,
                    columns: [
                        {
                            field: elt0 + '_id',
                            fieldType: 'INTEGER',
                            constraint: 'FOREIGN KEY ("' + elt0 + '_id") REFERENCES "' + elt0 + '"("Pk_' + elt0 + '_id")'
                        }, {
                            field: rfield.name + '_id',
                            fieldType: 'INTEGER',
                            constraint: 'FOREIGN KEY ("' + rfield.name.toLowerCase() + '_id") REFERENCES "' + elt0 + '"("Pk_' + elt0 + '_id")'
                        },
                    ]
                })
            })
            rfields.filter(field => field.relationType == relationships.manyToMany && field.activeSide == true ).forEach(rfield => { 
                let elt0 = utils.getSQLTableName(type.typeName)
                let elt1 = utils.getSQLTableName(rfield.type.toLowerCase())
                result.push({
                    name: type.typeName + "_" + rfield.type.toLowerCase() + "_" + rfield.name,
                    sqlname: elt0 + "_" + elt1 + "_" + rfield.name.toLowerCase(),
                    isJoinTable: true,
                    columns: [
                        {
                            field: elt0 + '_id',
                            fieldType: 'INTEGER',
                            constraint: 'FOREIGN KEY ("' + elt0 + '_id") REFERENCES "' + elt0 + '"("Pk_' + elt0 + '_id")'
                        }, {
                            field: rfield.name + '_id',
                            fieldType: 'INTEGER',
                            constraint: 'FOREIGN KEY ("' + rfield.name.toLowerCase() + '_id") REFERENCES "' + elt1 + '"("Pk_' + elt1 + '_id")'
                        },
                    ]
                })
            })
        }
    })
    return result
}

const getManyToManyTableBetween = (typeOne, typeTwo, manyToManyTables) => {
    let result = ""
    manyToManyTables.forEach(table => {
        if (table.name.includes(typeOne) && table.name.includes(typeTwo)) {
            result = table
            return result
        }
    })
    return result
}

const getQuerySelfJoinOne = (currentTypeName, fields) => {
    let result = ""
    fields.forEach(field => {
        if (field.type === currentTypeName) {
            result += "SELECT * FROM \"" + currentTypeName + "\" as t1 WHERE t1.\"Pk_Employe_id\" = (SELECT \"" + field.name.toLowerCase() + "_id\" FROM  \"" + currentTypeName + "\" WHERE \"" + currentTypeName + "\".\"Pk_" + currentTypeName + "_id\" = :value)"
        }
    })
    return result
}

const getQuerySelfJoinMany = (currentTypeName, fields) => {
    let result = ""
    fields.forEach(field => {
        if (field.type === currentTypeName) {
            result += "SELECT t2.* FROM \"" + currentTypeName + "\" as t1 LEFT OUTER JOIN \"" + currentTypeName + "_" + field.name.toLowerCase() + "\" as joint ON t1.\"Pk_" + currentTypeName + "_id\" = joint.\"" + currentTypeName.toLowerCase() + "_id\" LEFT OUTER JOIN \"" + currentTypeName + "\" as t2 ON joint." + field.name.toLowerCase() + "_id = t2.\"Pk_" + currentTypeName + "_id\" WHERE t1.\"Pk_" + currentTypeName + "_id\" = :value '+sorting+' '+limit+' '+offset"
        }
    })
    return result
}

/** SCHEMA UPDATE */

const compareFieldsForUpdate = (entity, field_check) => {
    for (let field in entity) {
        if (entity[field].name == field_check.name) {
            for (let sub_field in entity[field]) {
                if (sub_field != "arguments") {
                    if (entity[field][sub_field] != field_check[sub_field]) {
                        return false;
                    }
                }
            }
        }
    }
    return true;

}

const compareFieldsOfFields = (old_field, new_field) => {
    for (let field in old_field) {
        if (field != "arguments") {
            if (old_field[field] != new_field[field]) {
                return false;
            }
        }
    }
    return true;
}

const compareField = (old_entity, new_entity) => {

    for (let field in old_entity) {
        if (!new_entity[field]) {
            return false;
        }
        if (compareFieldsOfFields(old_entity[field], new_entity[field]) == false) {
            return false
        }
    }
    return true;
}

const findDifferencesBetweenEntities = (name_entity, old_entity, new_entity) => {
    let add_fields = []
    let delete_fields = []
    let update_fields = []
    for (let field in new_entity) {
        if (containField(old_entity, new_entity[field].name) == false) {
            add_fields.push({name: name_entity, column: new_entity[field]})
        } else {
            if (compareFieldsForUpdate(old_entity, new_entity[field]) == false) {
                update_fields.push({
                    name: name_entity,
                    column_old: getField(old_entity, new_entity[field].name),
                    column_new: new_entity[field]
                })
            }
        }
    }
    for (let field in old_entity) {
        if (containField(new_entity, old_entity[field].name) == false) {
            if (old_entity[field].type === "String" || old_entity[field].type === "ID" || old_entity[field].type === "Boolean" || old_entity[field].type === "Int") {
                delete_fields.push({name: name_entity, column: old_entity[field].name})
            } else {
                delete_fields.push({
                    name: name_entity,
                    column: "Fk_" + old_entity[field].type + "_id"
                })
            }

        }
    }
    // console.log("NEW FIELDS : ", add_fields)
    // console.log("UPDATED FIELDS : ", update_fields)
    // console.log("DELETED FIELDS : ", delete_fields)
    return [add_fields, update_fields, delete_fields]
}

const compareSchema = (old_schema, new_schema) => {
    let add_entities = []
    let drop_entities = []
    let update_entities = []
    for (let entity in new_schema) {
        if (entity !== "Query" && new_schema[entity].type !== "ScalarTypeDefinition" && entity !== "Mutation" && new_schema[entity].type !== "Mutation") {
            if (!old_schema[entity]) {
                add_entities.push(entity)
            } else {
                if (compareField(old_schema[entity].fields, new_schema[entity].fields) == false) {
                    update_entities.push(entity)
                }
            }
        }
    }
    for (let entity in old_schema) {
        if (entity !== "Query" && old_schema[entity].type !== "ScalarTypeDefinition" && entity !== "Mutation" && old_schema[entity].type !== "Mutation") {
            if (!new_schema[entity]) {
                drop_entities.push({name: entity})
            }
        }
    }
    // console.log("Add entities : ", add_entities)
    // console.log("Drop entities : ", drop_entities)
    // console.log("Update entities : ", update_entities)
    let updates = [[], [], []]
    update_entities.forEach(x => {
        console.log("----- UPDATE ", x, " -----")
        let tmp = findDifferencesBetweenEntities(x, old_schema[x].fields, new_schema[x].fields)
        updates[0].push(tmp[0])
        updates[1].push(tmp[1])
        updates[2].push(tmp[2])
    })
    return [add_entities, updates, drop_entities]
}


/** UTILS FUNCTIONS */

// Check if a non scalar type is present in field
const hasFieldType = (type, fieldType) => {
    let answers = false
    let fieldInfo = null
    type.fields.forEach(field => {
        if (field.type === fieldType) {
            answers = true
            fieldInfo = field
        }
    })
    return {fieldInfo: fieldInfo, answers: answers}
}

const formatName = (name) => {
    return name.replace(/[^a-z]/gi, '');
}

const addIdTypes = (types) => {
    types.forEach(type => {
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.type !== "ScalarTypeDefinition" && type.type !== "EnumTypeDefinition") {
            if (!type.fields.find(field => field.name === "id")) {
                type.fields.push({
                    "name": "id",
                    "arguments": [],
                    "directives": [],
                    "isDeprecated": false,
                    "noNull": true,
                    "isArray": false,
                    "noNullArrayValues": false,
                    "type": "ID"
                })
            }
        }
    })

    return types
}


/**
 * Set up types fields to handle tracking of foreign key that might have been added by other types 
 * 
 * @param {*} types list of types  
 * @returns nothing
 */

const addMissingInfos = (types) => {
    types.forEach(type => {
        if (type.typeName !== "Query" && type.typeName !== "Mutation" && type.type !== "ScalarTypeDefinition" && type.type !== "EnumTypeDefinition") {
            // stores all the relations which were found for a give type
            type["relationList"] = [] // { "type" : null, "relation" : }
            type.fields.forEach(field =>{
                // foreign key of the field
                field["foreign_key"] = null
                // if the field is a relation
                field["relation"] = false
                // if the field is added or is adding to another field
                field["delegated_field"] = {
                    "state" : false,
                    "side" : null, 
                    "associatedWith": {
                        "type": null,
                        "fieldName" : null
                    }
                }
                // if the field will appear in final model (tables) ex for oneToMany relation the field may dissapear
                field["in_model"] = true

                // contains info if the field will be in a joinTable in final model, the name of the table
                // the name of the fields associated in the table 

                field["joinTable"] = {
                    "state" : false,
                    "name" : null,
                    "contains" : []
                        
                    
                }

            })
        }
    })

    return types
}


const isSchemaValid = (types) => {
    let typesName = types.map(type => type.typeName)

    if (!typesHaveId(typesName, types)) 
        return {response: false, reason: "Missing required id field of type ID in one or multiple Entity"}
    
    if (!fieldTypeExists(typesName, types)) 
        return {response: false, reason: "One Entity has one or multiple fields of undefined types. Please use default scalar, declare your own scalar or declare missing entity type"}
    
    return {response: true}
}

const typesHaveId = (typesName, types) => {
    for (let index = 0; index < types.length; index++) {
        if (typesName[index] !== "Query" && typesName[index] !== "Mutation" && types[index].type !== "ScalarTypeDefinition" && types[index].type !== "EnumTypeDefinition") {
            if (!types[index].fields.find(field => field.name === "id")) {
                return false
            }
        }
    }
    return true
}

// Check if the types of field are correct (default scalar, personalized scalar of other existing entities)
const fieldTypeExists = (typesName, types) => {
    for (let i = 0; i < types.length; i++) {
        let fields = types[i].fields
        for (let j = 0; j < fields.length; j++) {
            if (fields[j].type !== "ID" && fields[j].type !== "String" && fields[j].type !== "Int" && fields[j].type !== "Boolean" && fields[j].type !== "Float") { // Default scalar
                if (!typesName.includes(fields[j].type)) { // User scalars or Entities
                    return false
                }
            }

        }
    }
    return true
}

const getField = (entity, fieldName) => {
    for (let field in entity) {
        if (entity[field].name == fieldName) {
            return entity[field]
        }
    }
    return undefined
}

const containField = (entity, fieldName) => {
    for (let field in entity) {
        if (entity[field].name == fieldName) 
            return true
        
    }
    return false;
}

const findTable = (tables, name) => {
    for (let table in tables) {
        if (tables[table].name == name) {
            return tables[table]
        }
    }
    return undefined
}

const findField = (fields, columnName) => {
    for (let pos in fields) {
        if (fields[pos].field === columnName) {
            return fields[pos]
        }
    }
    return undefined
}


module.exports = {
    getAllTypes: getAllTypes,
    getFieldsDirectiveNames: getFieldsDirectiveNames,
    getFieldsParsed: getFieldsParsed,
    getFieldsInput: getFieldsInput,
 //   buildResolverInterface: buildResolverInterface,
    getRequire: getRequire,
    getGraphqlType: getGraphqlType,
    getResolveType: getResolveType,
    getEnumValues: getEnumValues,
    getFieldsParsedHandler: getFieldsParsedHandler,
  //  getDeleteMethodsMany: getDeleteMethodsMany,
    getAllTables: getAllTables,
    getInitEachModelsJS: getInitEachModelsJS,
    getInitEachFieldsModelsJS: getInitEachFieldsModelsJS,
    getCreationOfModels: getCreationOfModels,
    getListOfModelsExport: getListOfModelsExport,
    getRelations: getRelations,
 //   isOneOnly: isOneOnly,
 //   isManyOnly: isManyOnly,
    isSelfJoinOne: isSelfJoinOne,
    isSelfJoinMany: isSelfJoinMany,
    // getRelationBetween: getRelationBetween,
    getJoinTables: getJoinTables,
 //   getManyToManyTableBetween: getManyToManyTableBetween,
    getQuerySelfJoinOne: getQuerySelfJoinOne,
    getQuerySelfJoinMany: getQuerySelfJoinMany,
    hasFieldType: hasFieldType,
    formatName: formatName,
    addIdTypes: addIdTypes,
    isSchemaValid: isSchemaValid,
    getFieldsCreate: getFieldsCreate,
    getFieldsName: getFieldsName,
    compareSchema: compareSchema,
    findTable: findTable,
    findField: findField,
    addMissingInfos : addMissingInfos
}
