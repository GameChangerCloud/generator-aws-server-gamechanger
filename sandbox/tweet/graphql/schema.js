const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLNonNull,
	GraphQLSchema,
	GraphQLBoolean,
	GraphQLList

} = require('graphql')

const rootQuery = require ('./types/query')
const rootMutation = require ('./types/mutation')
const dbHandler = require ('../database/handler')


const schema = new GraphQLSchema({
	
	query: rootQuery,
	mutation: rootMutation
})

module.exports = schema