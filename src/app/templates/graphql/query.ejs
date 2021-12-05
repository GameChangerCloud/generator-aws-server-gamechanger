const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLNonNull,
	GraphQLBoolean,
	GraphQLInt,
	GraphQLInterfaceType
} = require('graphql')

const dbHandler = require('../../database/handler')


module.exports = new GraphQLObjectType({
	name: 'QueryType',
	description: '',
	fields: () => ({<%typesName.forEach(typeName => {%>
		<%if (typeName !== "Query" && typeName !== "Mutation" && !scalarTypeNames.includes(typeName)){%><%-pluralize.plural(typeName.toLowerCase())%>: { 
			type: new GraphQLList(<%-typeName%>Type),
			args: {
				limit: { 
					type: GraphQLInt,
					description: "Limit the number of result" 
				},
				skip: { 
					type: GraphQLInt,
					description: "Implements pages notion, number of element to skip"  
				},
				sort_field: { 
					type: GraphQLString,
					description: "Default value : id"  
				},
				sort_order: { 
					type: GraphQLInt,
					description: "Value 1 or -1 (default 1)"  
				}
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, '<%-typeName%>Type')
			}
		},
		<%-typeName.toLowerCase()%>: { 
			type: <%-typeName%>Type,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, '<%-typeName%>Type')
			}
		},<%}%><%})%>
		<%-otherQuery%>
	}),
	

})

<%typesName.forEach(typeName => {%><%if (typeName !== "Query" && typeName !== "Mutation" && !scalarTypeNames.includes(typeName)){%>const <%-typeName%>Type = require('./<%-typeName.toLowerCase()%>')
<%}%><%})%>
