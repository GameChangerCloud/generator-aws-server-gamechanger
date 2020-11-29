const sqlUtils = {

    /***
    *   Construct all the statements for creating the tables in the database
    */
    getSQLCreateTables = () => {
        let sqlStatements = [];
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "Tweet" ("Pk_Tweet_id" Int PRIMARY KEY NOT NULL,"body" text,"date" timestamp,"Fk_User_id" Int,"Fk_Stat_id" Int)');
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "User" ("Pk_User_id" Int PRIMARY KEY NOT NULL,"username" text,"firstname" text,"lastname" text,"fullname" text,"name" text)');
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "Stat" ("Pk_Stat_id" Int PRIMARY KEY NOT NULL,"views" Int,"likes" Int,"retweets" Int,"responses" Int)');
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "Notification" ("Pk_Notification_id" Int PRIMARY KEY NOT NULL,"type" text)');
    sqlStatements.push('CREATE TABLE IF NOT EXISTS "Meta" ("Pk_Meta_id" Int PRIMARY KEY NOT NULL,"count" Int)');
        return sqlStatements;
    },

    getSQLTables = () => {
        let sqlTables = [];
        sqlTables.push("Tweet");
        sqlTables.push("User");
        sqlTables.push("Stat");
        sqlTables.push("Notification");
        sqlTables.push("Meta");
        return sqlTables;
    }
}

module.exports = sqlUtils