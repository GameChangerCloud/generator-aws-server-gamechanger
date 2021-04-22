const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInterfaceType
} = require('graphql')

const {
  ObjectID,
  Date: DateGraphQL, // Avoid same name issue when casting into a new Date()
  Time,
  DateTime,
  UtcOffset,
  NonPositiveInt,
  PositiveInt,
  NonNegativeInt,
  NegativeInt,
  NonPositiveFloat,
  PositiveFloat,
  NonNegativeFloat,
  NegativeFloat,
  UnsignedFloat,
  UnsignedInt,
  BigInt,
  Long,
  EmailAddress,
  URL,
  PhoneNumber,
  PostalCode,
  GUID,
  HexColorCode,
  HSL,
  HSLA,
  RGB,
  RGBA,
  IPv4,
  IPv6,
  MAC,
  Port,
  ISBN,
  USCurrency,
  Currency,
  JSON,
  JSONObject,
  Byte
} = require('../defaultScalarsMap')

const dbHandler = require('../../database/handler')
const { types } = require('pg')


module.exports = new GraphQLObjectType({
  name: 'MutationType',
  description: '',
  fields: () => ({

    <% - include('../database/partials/getMutationFields.ejs', { typesName: typesName, types: types, defaultScalars: defaultScalars }) _%>
  //<% -mutationFields %>


		<% -otherMutation %>
	}),



})

  <% typesName.forEach(typeName => {%><%if (typeName !== "Query" && typeName !== "Mutation" && !defaultScalars.includes(typeName)) {%>const <% -typeName %> Type = require('./<%-typeName.toLowerCase()%>')
    <%}%><%}) %>
