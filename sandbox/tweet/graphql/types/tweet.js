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
	name: 'TweetType',
	description: '',
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLID) },
		body: { type: GraphQLString },
		date: { 
			type: new GraphQLNonNull(DateTime),
			resolve: (obj, args, context, info) => {
				return new Date(obj.date)
			}
		},
		author: { 
			type: UserType,
			resolve: (obj, args, context, info) => {
				let result = dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: "oneOnly"}, 'UserType').then((data) => {
				return data
			})
			return result
			}
		},
		stats: { 
			type: StatType,
			resolve: (obj, args, context, info) => {
				let result = dbHandler.handleGet({parentId: obj.id, parentTypeName: info.parentType, relationType: "oneOnly"}, 'StatType').then((data) => {
				return data
			})
			return result
			}
		},
	}),
	

})

const UserType = require('./user')
const StatType = require('./stat')
