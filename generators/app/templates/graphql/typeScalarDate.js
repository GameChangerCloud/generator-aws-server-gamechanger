const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLInt,
	GraphQLInterfaceType,
	GraphQLScalarType
} = require('graphql')

const validator = require('validator')

module.exports = new GraphQLScalarType({
	name: 'DateType',
	description: "Date",
	serialize: (value) => {
		if(validator.isISO8601(value)) {
			return value;
		}
		throw new Error("DateType must be of correct string format")
	},
	parseValue: (value) => {
		if(validator.isISO8601(value)) {
			return value;
		}
		throw new Error("DateType must be of correct string format")
	},
	parseLiteral: (ast) => {
		if(validator.isISO8601(ast.value)) {
			return ast.value;
		}
		throw new Error("DateType must be of correct string format")
	}
})

