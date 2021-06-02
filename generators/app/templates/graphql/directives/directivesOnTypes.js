<%for (let index = 0; index < typesName.length; index++) {
    let schemaDir = types[index].directives_%>
       const <%-typesName[index].toLowerCase() %>Directives = {            
         <%- include('../../database/partials/getDirectivesForResolve.ejs', {directive : schemaDir, name : typesName[index]}) _%>,
         <% for (let j = 0; j < types[index].fields.length; j++) { 
           let field = types[index].fields[j] _%>
         <%- include('../../database/partials/getDirectivesForResolve.ejs', {directive : field.directives, name : field.name}) _%>,
     <%}_%>}
 <%}_%>

 
 module.exports = {<%for (let index = 0; index < typesName.length; index++) {_%>
    <%-typesName[index].toLowerCase() %>Directives,
<%}_%>
}