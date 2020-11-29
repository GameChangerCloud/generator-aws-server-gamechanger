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
	fields: () => ({
		tweets: { 
			type: new GraphQLList(TweetType),
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
				return dbHandler.handleGet(args, 'TweetType')
			}
		},
		tweet: { 
			type: TweetType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, 'TweetType')
			}
		},
		
		users: { 
			type: new GraphQLList(UserType),
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
				return dbHandler.handleGet(args, 'UserType')
			}
		},
		user: { 
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, 'UserType')
			}
		},
		stats: { 
			type: new GraphQLList(StatType),
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
				return dbHandler.handleGet(args, 'StatType')
			}
		},
		stat: { 
			type: StatType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, 'StatType')
			}
		},
		notifications: { 
			type: new GraphQLList(NotificationType),
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
				return dbHandler.handleGet(args, 'NotificationType')
			}
		},
		notification: { 
			type: NotificationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, 'NotificationType')
			}
		},
		metas: { 
			type: new GraphQLList(MetaType),
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
				return dbHandler.handleGet(args, 'MetaType')
			}
		},
		meta: { 
			type: MetaType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: (obj, args, context, info) => {
				return dbHandler.handleGet(args, 'MetaType')
			}
		},
		
		
						TweetsMeta: { 
			type: MetaType,
			resolve: (obj, args, context, info) => {
				 // To define 
			}
		},
						NotificationsMeta: { 
			type: MetaType,
			resolve: (obj, args, context, info) => {
				 // To define 
			}
		},

	}),
	

})

const TweetType = require('./tweet')
const UserType = require('./user')
const StatType = require('./stat')
const NotificationType = require('./notification')
const MetaType = require('./meta')

