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
<% if(typesInterface){%><%typesInterface.forEach(type => {%>
const <%-type%> = require ('./types/<%-type.substring(0, type.indexOf("Type")).toLowerCase()%>')<%})%><%}%>

const schema = new GraphQLSchema({
	<% if(typesInterface){%>types: [<%-typesInterface-%>],<%}%>
	query: rootQuery,
	mutation: rootMutation
})

module.exports = schema