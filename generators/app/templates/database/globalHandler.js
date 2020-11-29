/******* Start of generated part using handlerRequire */
<%-handlerRequire%>
/******* Start of generated part using handlerRequire */

module.exports = {

	handleGet: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerGetSwitchCase */
			<%-handlerGetSwitchCase%>
			/******* Start of generated part using handlerGetSwitchCase */
			default:
			break
		}
	},

	handleDelete: (id, type) => {
		switch (type) {
			/******* Start of generated part using handlerDeleteSwitchCase */
			<%-handlerDeleteSwitchCase%>
			/******* Start of generated part using handlerDeleteSwitchCase */
			default:
			break
		}
	},

	handleUpdate: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerUpdateSwitchCase */
			<%-handlerUpdateSwitchCase%>
			/******* End of generated part using handlerUpdateSwitchCase   */
			default:
			break
		}
	},

	handleCreate: (args, type) => {
		switch (type) {
			/******* Start of generated part using handlerCreateSwitchCase */
			<%-handlerCreateSwitchCase%>
			/******* Start of generated part using handlerCreateSwitchCase */
			default:
				break
		}
	}


}