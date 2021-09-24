const directiveResolver =(a, args,directives, resolvers) =>{
    if (directives[a] != null){
        for (dir in directives[a] ){
            let passedArgs = []

            if (args[a] == undefined){
                passedArgs.push(a)

            }
            else{
                passedArgs = [args[a]]

            }
            if (directives[a][dir].args != null){
                for (i in directives[a][dir].args){
                    passedArgs.push(directives[a][dir].args[i].value)
                }
            }
            if(directives[a][dir].name in resolvers){
                let type = resolvers[directives[a][dir].name].type
                switch(type){
                    case "verify":
                        if (resolvers[directives[a][dir].name].resolve.apply(this, passedArgs) == false){
                            console.log("{\"errors\" : \"field ( " + a + " ) doesnt verify constraint : \"" + directives[a][dir].name + "\" }")
                            return null
                        }
                        break
                    case "modify":
                        console.log("{\"info\" : \"field ( " + a + " ) modified with : \"" + directives[a][dir].name + " }")
                        return resolvers[directives[a][dir].name].resolve.apply(this, passedArgs)
                    case "warn":
                        console.log("{\"info\" : \"info about field ( " + a + " ) : \"" + resolvers[directives[a][dir].name].resolve.apply(this, passedArgs)  + " }")
                        return args[a]
                    case "notifyWhere":
                        break
                    case "Perform":
                        resolvers[directives[a][dir].name].resolve.apply(this, passedArgs)
                        return args[a]
                        break
                }
            }
        }
    }
    return args[a]
    
		

    
}

module.exports ={directiveResolver}