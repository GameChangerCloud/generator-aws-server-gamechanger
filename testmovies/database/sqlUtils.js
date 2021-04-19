const sqlUtils = {

    /***
    *   Construct all the statements for creating the tables in the database
    */
    getSQLCreateTables = () => {
        let sqlStatements = [];
        sqlStatements.push('CREATE TABLE IF NOT EXISTS "Movie" (' + 
        `
    "Pk_Movie_id" Int PRIMARY KEY NOT NULL,
    "title" text
`        sqlStatements.push('CREATE TABLE IF NOT EXISTS "Actor" (' + 
        `
    "Pk_Actor_id" Int PRIMARY KEY NOT NULL,
    "name" text
`        sqlStatements.push('CREATE TABLE IF NOT EXISTS "Actor_Movie" (' + 
        `
    "Actor_id" INTEGER,
    "Movie_id" INTEGER
`        return sqlStatements;
    },

    getSQLTables = () => {
        let sqlTables = [];
        sqlTables.push("Movie");
        sqlTables.push("Actor");
        sqlTables.push("Actor_Movie");
        return sqlTables;
    }
}

module.exports = sqlUtils