const {
	GraphQLEnumType,
} = require ('graphql')

module.exports = new GraphQLEnumType({
	name: '<%-enumName%>Type',
	values: {
			<%-enumValues%>
	},
});
