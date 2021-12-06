const utils = {


	getSQLTableName(typeName) {
		let minifiedType = typeName.charAt(0).toLowerCase() + typeName.slice(1) 
			.replace(/([A-Z])/g, (e) => { return '_' + e.toLowerCase()})
			.replace(/(__)/g, '_')
		return minifiedType;
	}

}

module.exports = utils