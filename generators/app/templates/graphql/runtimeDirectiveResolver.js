const directiveResolver =(a, args,directives, resolvers) =>{

    // console.log(JSON.stringify(directives))
		// for (elem in resolvers){
		// 	console.log(elem)
		// }
    if (directives[a] != null){
        //console.log("----"+ JSON.stringify(a)+"-----")

        for (dir in directives[a] ){
            let passedArgs = [args[a]]
            //console.log(resolvers[directives[a][dir].name].getType())
            if (directives[a][dir].args != null){
                for (i in directives[a][dir].args){
                    passedArgs.push(directives[a][dir].args[i].value)
                }
            }
            // console.log("################# =  " +passedArgs)
            // console.log("********"+ JSON.stringify(directives[a][dir].args) +"µµµµµµµµµµµ")
            let type = resolvers[directives[a][dir].name].getType()
            //console.log("LEEEEEEEEEEEEEEE TYYYYYYYYPE " + type)
            switch(type){
                case "verify":
                    //console.log("shrek ON EST DEDANS CONO" + resolvers[directives[a][dir].name].resolve.apply(this, passedArgs) )
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
            }
        }
    }
    return args[a]
    
		

    
}

module.exports ={directiveResolver}