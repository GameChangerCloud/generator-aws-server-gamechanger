<%const resolvers = {
    length : {
        name : "length",
        type: "verify",
        resolve: function (field, min, max) {
            if( field.length >= min && field.length <= max){
                return true
            }
            else{
                return false
            }
        }
    },

    format : {
        name : "format",
        type: "warn",
        resolve: function (field, format) {
            //console.log(" field  ( "+ field + " ) should be of format" + format)

            return "this field  should be of format : " + format
        }
    },

    auth : {
        name : "auth",
        type: "warn",
        resolve: function (field, requirement) {
            //console.log(" field  ( "+ field + " ) should be of format" + format)

            return "requires authentification : " + requirement
        }
    },

    deprecated : {
        name : "deprecated",
        type: "warn",
        resolve: function (field) {
            //console.log("this field ("+ field +") is deprecated")

            return "this field ("+ field +") is deprecated"
        }
    },

    warn : {
        name : "warn",
        type: "warn",
        resolve: function (field) {
            //console.log("just a random warning")
            return "just warning you"
        }
    },

    upperCase : {
        name : "upperCase",
        type: "modify",
        resolve: function (field) {
            return field.toUpperCase()
        }
    },

    valueReducer : {
        name : "valueReducer",
        type: "modify",
        resolve: function (field, value) {
            return field - value
        }
    },

    hasInverse : {
        name : "hasInverse",
        type: "Perform",
        resolve: function (field, value) {
            console.log("inverse of" + value)
        }
    },

    search: {
        name : "search",
        type: "Perform",
        resolve: function (field, value) {
            console.log("search")
        }
    }


}%>




<% for (k in resolvers){ 
    if (dirNames.includes(k)){_%>
        const <%-k %> = {
            name : "<%- k %>" ,
            type : "<%- resolvers[k].type %>" ,
            resolve : <%-resolvers[k].resolve%>
        }
    <%}%>
    
<%}%>
<% let resolversList =[]
for (k in resolvers){ 
    if (dirNames.includes(k) ){
        resolversList.push(k)
    }
}%>
module.exports ={<%for (k in resolversList){ %><%if(k != 0){%>,<%}%><%-resolversList[k]%><%}%>}