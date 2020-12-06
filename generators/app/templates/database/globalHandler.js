/******* Start of generated part using tables */
<% tables.forEach(table => { -%>
	<%- include('./partials/requireByEntity', {entity: table.name}) %>
<% }); %>
/******* End of generated part using tables */

module.exports = {

	handleGet: (args, type) => {
		switch (type) {
			/******* Start of generated part using tables */
			<% tables.forEach(table => { %>
			case "<%= table.name %>Type":
				if(args) {
					return handler<%= table.name %>.getMethodsByArgs(args)
				}
				else {
					return handler<%= table.name %>.getMethods()
				}
			<% }); %>
			/******* End of generated part using tables */
			default:
			break
		}
	},

	handleDelete: (id, type) => {
		switch (type) {
			/******* Start of generated part using tables */
			<% tables.forEach(table => { %>
				case "<%= table.name %>Type":
					return handler<%= table.name %>.deleteMethods(id)
			<% }); %>
			/******* End of generated part using tables */
			default:
			break
		}
	},

	handleUpdate: (args, type) => {
		switch (type) {
			/******* Start of generated part using tables */
			<% tables.forEach(table => { %>
				case "<%= table.name %>Type":
					return handler<%= table.name %>.updateMethods(args)
			<% }); %>
			/******* End of generated part using tables */
			default:
			break
		}
	},

	handleCreate: (args, type) => {
		switch (type) {
			/******* Start of generated part using tables */
			<% tables.forEach(table => { %>
				case "<%= table.name %>Type":
					return handler<%= table.name %>.createMethods(args)
			<% }); %>
			/******* End of generated part using tables */
			default:
				break
		}
	}


}