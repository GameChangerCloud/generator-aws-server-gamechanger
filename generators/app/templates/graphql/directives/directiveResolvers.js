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
        },
        getType : function(){
            return this.type
        }
    },

    format : {
        name : "format",
        type: "warn",
        resolve: function (field, format) {
            //console.log(" field  ( "+ field + " ) should be of format" + format)

            return "this field  should be of format : " + format
        },
        getType : function(){
            return this.type
        }
    },

    auth : {
        name : "auth",
        type: "warn",
        resolve: function (field, requirement) {
            //console.log(" field  ( "+ field + " ) should be of format" + format)

            return "requires authentification : " + requirement
        },
        getType : function(){
            return this.type
        }
    },

    deprecated : {
        name : "deprecated",
        type: "warn",
        resolve: function (field) {
            //console.log("this field ("+ field +") is deprecated")

            return "this field ("+ field +") is deprecated"
        },
        getType : function(){
            return this.type
        }
    },

    warn : {
        name : "warn",
        type: "warn",
        resolve: function (field) {
            //console.log("just a random warning")
            return "just warning you"
        },
        getType : function(){
            return this.type
        }
    },

    upperCase : {
        name : "upperCase",
        type: "modify",
        resolve: function (field) {
            return field.toUpperCase()
        },
        getType : function(){
            return this.type
        }
    },

    valueReducer : {
        name : "valueReducer",
        type: "modify",
        resolve: function (field, value) {
            return field - value
        },
        getType : function(){
            return this.type
        }
    },


}%>




<% for (k in resolvers){ 
    if (dirNames.includes(k)){_%>
        const <%-k %> = {
            type : "<%- resolvers[k].type %>" ,
            resolve : <%-resolvers[k].resolve%> ,
            getType : <%-resolvers[k].getType%>
        }
    <%}%>
    
<%}%>
module.exports ={<%= dirNames %>}