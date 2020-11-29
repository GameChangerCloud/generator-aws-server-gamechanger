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


module.exports = new GraphQLObjectType({
	name: 'MutationType',
	description: '',
	fields: () => ({
		tweetDelete: { 
			    type: TweetType,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, 'TweetType').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, 'TweetType').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            tweetUpdate: { 
			    type: TweetType,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
body: {type: GraphQLString},
date: {type: DateTime},
author: {type: GraphQLID},
stats: {type: GraphQLID},
},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, 'TweetType').then(record => {
                        return dbHandler.handleGet(args, 'TweetType').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        tweetCreate: {
                type: TweetType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
body: {type: GraphQLString},
date: {type: DateTime},
author: {type: GraphQLID},
stats: {type: GraphQLID},
},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, 'TweetType').then(record => {
                        return dbHandler.handleGet(args, 'TweetType').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },

userDelete: { 
			    type: UserType,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, 'UserType').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, 'UserType').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            userUpdate: { 
			    type: UserType,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
username: {type: GraphQLString},
firstname: {type: GraphQLString},
lastname: {type: GraphQLString},
fullname: {type: GraphQLString},
name: {type: GraphQLString},
},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, 'UserType').then(record => {
                        return dbHandler.handleGet(args, 'UserType').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        userCreate: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
username: {type: GraphQLString},
firstname: {type: GraphQLString},
lastname: {type: GraphQLString},
fullname: {type: GraphQLString},
name: {type: GraphQLString},
},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, 'UserType').then(record => {
                        return dbHandler.handleGet(args, 'UserType').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },

statDelete: { 
			    type: StatType,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, 'StatType').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, 'StatType').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            statUpdate: { 
			    type: StatType,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
views: {type: GraphQLInt},
likes: {type: GraphQLInt},
retweets: {type: GraphQLInt},
responses: {type: GraphQLInt},
},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, 'StatType').then(record => {
                        return dbHandler.handleGet(args, 'StatType').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        statCreate: {
                type: StatType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
views: {type: GraphQLInt},
likes: {type: GraphQLInt},
retweets: {type: GraphQLInt},
responses: {type: GraphQLInt},
},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, 'StatType').then(record => {
                        return dbHandler.handleGet(args, 'StatType').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },

notificationDelete: { 
			    type: NotificationType,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, 'NotificationType').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, 'NotificationType').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            notificationUpdate: { 
			    type: NotificationType,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
type: {type: GraphQLString},
},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, 'NotificationType').then(record => {
                        return dbHandler.handleGet(args, 'NotificationType').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        notificationCreate: {
                type: NotificationType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
type: {type: GraphQLString},
},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, 'NotificationType').then(record => {
                        return dbHandler.handleGet(args, 'NotificationType').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },

metaDelete: { 
			    type: MetaType,
			    args: {
				    id: { type: new GraphQLNonNull(GraphQLID) },
			    },
			    resolve: (obj, args, context, info) => {
				    const recordToDelete = dbHandler.handleGet(args, 'MetaType').then(record => {
                        // Query to delete
                        return dbHandler.handleDelete(args.id, 'MetaType').then(() => {
                            return record
                        })
				    })
				    return recordToDelete
			    }
		    },
            metaUpdate: { 
			    type: MetaType,
			    args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
count: {type: GraphQLInt},
},
			    resolve: (obj, args, context, info) => {
                    const recordUpdated = dbHandler.handleUpdate(args, 'MetaType').then(record => {
                        return dbHandler.handleGet(args, 'MetaType').then(record => {
                            return record
                        })
                    })
                    return recordUpdated
			    }
		    },
	        metaCreate: {
                type: MetaType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLID) },
count: {type: GraphQLInt},
},
                resolve: (obj, args, context, info) => {
                    const recordCreated = dbHandler.handleCreate(args, 'MetaType').then(record => {
                        return dbHandler.handleGet(args, 'MetaType').then(record => {
                            return record
                        })
                    })
                    return recordCreated
                }
            },


		Tweet: { 
			type: TweetType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
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

