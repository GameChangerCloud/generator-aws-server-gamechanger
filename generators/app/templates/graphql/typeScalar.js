const {
	GraphQLScalarType
} = require('graphql')

const validator = require('validator')


module.exports = new GraphQLScalarType({
	name: '<%-scalarName%>',
	description: "",
	serialize: () => {return 1}, /* To define */
	parseValue: (value) => {return 1},/* To define */
	parseLiteral: (ast) => {return 1}/* To define */
})

