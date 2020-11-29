/******* Start of generated part using handlerRequire */
const handlerTweet = require('./handlers/handlerTweet')
const handlerUser = require('./handlers/handlerUser')
const handlerStat = require('./handlers/handlerStat')
const handlerNotification = require('./handlers/handlerNotification')
const handlerMeta = require('./handlers/handlerMeta')

/******* Start of generated part using handlerRequire */

module.exports = {

	handleGet: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerGetSwitchCase */
			case "TweetType": 
				if(args) {
					return handlerTweet.getMethodsByArgs(args)
				}
				else {
					return handlerTweet.getMethods()
				}
case "UserType": 
				if(args) {
					return handlerUser.getMethodsByArgs(args)
				}
				else {
					return handlerUser.getMethods()
				}
case "StatType": 
				if(args) {
					return handlerStat.getMethodsByArgs(args)
				}
				else {
					return handlerStat.getMethods()
				}
case "NotificationType": 
				if(args) {
					return handlerNotification.getMethodsByArgs(args)
				}
				else {
					return handlerNotification.getMethods()
				}
case "MetaType": 
				if(args) {
					return handlerMeta.getMethodsByArgs(args)
				}
				else {
					return handlerMeta.getMethods()
				}

			/******* Start of generated part using handlerGetSwitchCase */
			default:
			break
		}
	},

	handleDelete: (id, type) => {
		switch (type) {
			/******* Start of generated part using handlerDeleteSwitchCase */
			case "TweetType": 
					return handlerTweet.deleteMethods(id)
case "UserType": 
					return handlerUser.deleteMethods(id)
case "StatType": 
					return handlerStat.deleteMethods(id)
case "NotificationType": 
					return handlerNotification.deleteMethods(id)
case "MetaType": 
					return handlerMeta.deleteMethods(id)

			/******* Start of generated part using handlerDeleteSwitchCase */
			default:
			break
		}
	},

	handleUpdate: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerUpdateSwitchCase */
			case "TweetType": 
					return handlerTweet.updateMethods(args)
case "UserType": 
					return handlerUser.updateMethods(args)
case "StatType": 
					return handlerStat.updateMethods(args)
case "NotificationType": 
					return handlerNotification.updateMethods(args)
case "MetaType": 
					return handlerMeta.updateMethods(args)

			/******* End of generated part using handlerUpdateSwitchCase   */
			default:
			break
		}
	},

	handleCreate: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerCreateSwitchCase */
			case "TweetType": 
					return handlerTweet.createMethods(args)
case "UserType": 
					return handlerUser.createMethods(args)
case "StatType": 
					return handlerStat.createMethods(args)
case "NotificationType": 
					return handlerNotification.createMethods(args)
case "MetaType": 
					return handlerMeta.createMethods(args)

			/******* Start of generated part using handlerCreateSwitchCase */
			default:
				break
		}
	}


}