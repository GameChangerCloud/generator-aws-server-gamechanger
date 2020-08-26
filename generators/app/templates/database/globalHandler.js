<%-handlerRequire%>

module.exports = {

	handleGet: (args, type) => {
		switch (type) {
			<%-handlerGetSwitchCase%>
			default:
			break
		}
	},

	handleDelete: (id, type) => {
		switch (type) {
			<%-handlerDeleteSwitchCase%>
			default:
			break
		}
	},

	handleUpdate: (args, type) => {
		switch (type) {
			<%-handlerUpdateSwitchCase%>
			default:
			break
		}
	},

	handleCreate: (args, type) => {
		switch (type) {
			<%-handlerCreateSwitchCase%>
			default:
				break
		}
	}


}