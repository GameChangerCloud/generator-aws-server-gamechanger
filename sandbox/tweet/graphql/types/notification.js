const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLInt,
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


module.exports = new GraphQLObjectType({
	name: 'NotificationType',
	description: '',
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLID) },
		type: { type: GraphQLString },
	}),
	

})

