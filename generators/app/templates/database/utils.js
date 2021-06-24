
const utils = {

	constructOutputArray(data, table = null) {
		let outputArray = []
		var rows = []
		var cols = []

		// build an array of columns
		data.columnMetadata.map((v, i) => {
			cols.push(v.name)
		});

		// build an array of rows: { key=>value }
		data.records.map((r) => {
			var row = {}
			r.map((v, i) => {
				if (v.stringValue !== undefined) { row[cols[i]] = v.stringValue; }
				else if (v.blobValue !== undefined) { row[cols[i]] = v.blobValue; }
				else if (v.doubleValue !== undefined) { row[cols[i]] = v.doubleValue; }
				else if (v.longValue !== undefined) { row[cols[i]] = v.longValue; }
				else if (v.booleanValue !== undefined) { row[cols[i]] = v.booleanValue; }
				else if (v.isNull) { row[cols[i]] = null; }
			})
			rows.push(row)
		})

		for (let i = 0; i < rows.length; i++) {
			outputArray.push(this.constructOutputSimple(rows[i], cols, table))
		}
		return outputArray
	},

	constructOutputSimple(data, columns, table) {
		let res = {}
		if (data) {
			columns.forEach(column => {
				if (table) {
					if (column.includes("Pk_" + table)) {
						res['id'] = data[column]
					}
					else {
						res[column] = data[column]
					}
				}
				else {
					if (column.includes("Pk_")) {
						res['id'] = data[column]
					}
					else {
						res[column] = data[column]
					}
				}
			})
		}
		return res
	},


	getRemovedElements(previousArray, newArray) {
		// Sort by id
		previousArray.sort((a, b) => a.id - b.id) // current state
		newArray.sort((a, b) => a - b) // new state

		// Get only the id to have easier array to compare
		let previousStateIds = previousArray.map(element => element.id)
		let newStateIds = newArray.map(id => id)
		// Get the missing(s) elements 
		let inNew = {};
		let removedElements = []
		for (let x of newStateIds)
			inNew[x] = true;
		for (let x of previousStateIds)
			if (!inNew[x])
				removedElements.push(x)
		return removedElements
	},

	getAddedElements(previousArray, newArray) {
		// Sort by id
		previousArray.sort((a, b) => a.id - b.id) // current state
		newArray.sort((a, b) => a - b) // new state

		console.log(previousArray)
		let previousStateIds = previousArray.map(element => element.id)
		let newStateIds = newArray.map(id => id)
		// Get the missing(s) elements 
		let inPrevious = {};
		let addedElements = []
		for (let x of previousStateIds)
			inPrevious[x] = true;
		for (let x of newStateIds)
			if (!inPrevious[x])
				addedElements.push(x)
		return addedElements
	},

	escapeQuote(stringInput) {
		let regex = /'/
	    return stringInput ? "'" + stringInput.replace(regex, "''") + "'" : 'NULL'
	},

	getSQLTableName(typeName) {
		let minifiedType = typeName.charAt(0).toLowerCase() + typeName.slice(1) 
			.replace(/([A-Z])/g, (e) => { return '_' + e.toLowerCase()})
			.replace(/(__)/g, '_')
		return minifiedType;
	},

	startSqlTransaction(sqlRequests, beginParams, commitParams, sqlParams, rdsDataService){
		rdsDataService.beginTransaction(beginParams, function (err, data) {
			if (err){
				console.log(err, err.stack);
				rdsdataservice.rollbackTransaction(commitParams, function(err, data) {
					if (err) console.log(err, err.stack); // an error occurred
					else     console.log(data);           // successful response
					});
			}
			else{
				for( let index = 0; index <sqlRequests.length ; index ++){
					sqlParams.sql = sqlRequests[index]
					rdsDataService.executeStatement(sqlParams, (err, data) => {
						if (err) console.log(err, err.stack);
						else console.log(data);
					})
				}	
				commitParams.transactionId = data.transactionId
				rdsDataService.commitTransaction(commitParams, function (err, data) {
					if (err) console.log(err, err.stack); // an error occurred
					else console.log(data)
				})
			}
		}) 	
	
	}



	

}

module.exports = utils


