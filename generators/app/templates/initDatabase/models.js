<%_ types.forEach(type => {%>
    class <%-type.typeName%> {
    constructor(<%_type.fields.forEach((field, idx) => {_%>
        <%-field.name_%>
        <%_if(idx < type.fields.length - 1){_%>
        ,
        <%_}_%>
    <%_})_%>
    ){
        <%_type.fields.forEach((field, idx) => {_%>
            this.<%-field.name%> = <%-field.name%>;  
        <%_})_%>  
    }
    }
<%_})_%>

module.exports = {
    <%_ types.forEach((type, idx) => {_%>
        <%-type.typeName%>
        <%_if(idx < types.length - 1){_%>
        ,
        <%_}_%>

    <%_})_%>

}

