var tableName = "GC.Table";

function createStringJsonOfArray(array){
    var tmp = [];
    for(let i = 0; i < array.length; i++){
        tmp.push({"S" : array[i].id});
    }
    return tmp;
}

<%-functionAddQuery%>


module.exports = {


    <%-listOfFunction%>

}