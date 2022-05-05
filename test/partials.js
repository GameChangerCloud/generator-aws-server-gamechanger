var ejs = require('ejs');
var chai = require("chai");

chai.use(require('chai-string'));
chai.use(require("chai-as-promised"));
var should = chai.should(); 

const columns = [
    {
        "field": "Pk_Tweet_id",
        "fieldType": "Int",
        "noNull": false,
        "unique": false,
        "constraint": "PRIMARY KEY NOT NULL"
    },
    {
        "field": "body",
        "fieldType": "text",
        "noNull": false,
        "unique": false,
        "constraint": null
    },
    {
        "field": "date",
        "fieldType": "timestamp",
        "noNull": true,
        "unique": false,
        "constraint": null
    },
    {
        "field": "Fk_User_id",
        "fieldType": "Int",
        "noNull": false,
        "unique": false,
        "constraint": "FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\")"
    }
];

const resultColumns = [
    '"Pk_Tweet_id" Int PRIMARY KEY NOT NULL',
    '"body" text',
    '"date" timestamp NOT NULL',
    '"Fk_User_id" Int'
];

const tables = [
    {
        "name" : "TableTest",
        "sqlname" : "table_test", 
        "columns" : columns
    }
]
//Using columns without FK
const tables2 = [
    {
        "name" : "TableTest",
        "sqlname" : "table_test",
        "columns" : columns.slice(0,3)
    }
]

const deleteFields = [
    { name: 'User', sqlname:'user', column: 'firstname' },
    { name: 'User', sqlname:'user', column: 'lastname' },  
]

const updateFields = [
    {
        name: 'User',
        sqlname: 'user',
        column_old: {
            name: 'username',
            arguments: [],
            isDeprecated: false,
            noNull: false,
            isArray: false,
            noNullArrayValues: false,
            type: 'String'
        },
        column_new: {
            name: 'username',
            arguments: [],
            isDeprecated: false,
            noNull: true,
            isArray: false,
            noNullArrayValues: false,
            type: 'String'
        }
    }
]

const fields = [
    {
      name: "id",
      arguments: [
      ],
      isDeprecated: false,
      noNull: true,
      isArray: false,
      noNullArrayValues: false,
      type: "ID",
    },
    {
      name: "title",
      arguments: [
      ],
      isDeprecated: false,
      noNull: false,
      isArray: false,
      noNullArrayValues: false,
      type: "String",
    },
    {
      name: "actors",
      arguments: [
      ],
      isDeprecated: false,
      noNull: false,
      isArray: true,
      noNullArrayValues: false,
      type: "Actor",
    },
  ]
const scalarTypeNames =[
    undefined,
    undefined,
]
  
const relations = {
    oneToOne: [],
    manyToMany: [
        [
        "Actor",
        "Movie",
        ],
    ],
    oneToMany: [],
    manyToOne: [],
    oneOnly: [],
    manyOnly: [],
    selfJoinOne: [],
    selfJoinMany: [],
}
const manyToManyTables = [
    {
      name: "Actor_Movie",
      columns: [
        {
          field: "Actor_id",
          fieldType: "INTEGER",
          constraint: "FOREIGN KEY (\"Actor_id\") REFERENCES \"Actor\"(\"Pk_Actor_id\") ON DELETE CASCADE",
        },
        {
          field: "Movie_id",
          fieldType: "INTEGER",
          constraint: "FOREIGN KEY (\"Movie_id\") REFERENCES \"Movie\"(\"Pk_Movie_id\") ON DELETE CASCADE",
        },
      ],
    },
]

const scalars = require('../generators/app/constants')

  

describe('partials', function() {
    describe('partials/column', function() {
        const filename = './generators/app/templates/database/partials/column.ejs';
        it('should render PK database field', function() {
            return ejs.renderFile(filename, {"column": columns[0]}).should.eventually.equal(resultColumns[0]);
        });
        it('should render simple text field', function() {
            return ejs.renderFile(filename, {"column": columns[1]}).should.eventually.equal(resultColumns[1]);
        });
        it('should render simple date field', function() {
            return ejs.renderFile(filename, {"column": columns[2]}).should.eventually.equal(resultColumns[2]);
        });
        it('should render Foreign key field', function() {
            return ejs.renderFile(filename, {"column": columns[3]}).should.eventually.equal(resultColumns[3]);
        });
    });
    describe('partials/columns', function() {
        const filename = './generators/app/templates/database/partials/columns.ejs';
        const awaited = resultColumns.join(',').replace(/\s+/g, '');
        it('should render Full list of columns', function() {
            return ejs.renderFile(filename, {"columns": columns}).then(result => {
                awaited.should.equal(result.replace(/\s+/g, ''));
            });
        });
    });
    describe('partials/requireByEntity', function() {
        const filename = './generators/app/templates/database/partials/requireByEntity.ejs';
        it('should render require for Tweet', function() {
            return ejs.renderFile(filename, {"entity": "Tweet"}).should.eventually.equal("const handlerTweet = require(\'./handlers/handlerTweet\')");
        });
    });
    describe('partials/alter', function() {
        const filename = './generators/app/templates/database/partials/alter.ejs';
        it('should render altered primary column', function() {
            return ejs.renderFile(filename, {"name":"TableTest","columns": columns[0],"alterCase":"Deferred"}).should.eventually.equalIgnoreSpaces("")
        });
        it('should render altered fk column', function() {
            return ejs.renderFile(filename, {"name":"TableTest","columns": columns[3],"alterCase":"Deferred"}).should.eventually
                .equalIgnoreSpaces("{tableName: \"TableTest\", text: `ALTER TABLE \"TableTest\" ADD FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\") DEFERRABLE INITIALLY DEFERRED`},")
        }); 
        it('should render alter with add column', function() {
            return ejs.renderFile(filename, {"name":"TableTest","columns": columns[1],"alterCase":"AddColumn"}).should.eventually
                .equalIgnoreSpaces("{tableName: \"TableTest\", text: `ALTER TABLE \"TableTest\" ADD COLUMN body text`},")
        }); 
        it('should render alter with add column not null', function() {
            return ejs.renderFile(filename, {"name":"TableTest","columns": columns[1],"alterCase":"AddColumnNotNull"}).should.eventually
                .equalIgnoreSpaces("{tableName: \"TableTest\", text: `ALTER TABLE \"TableTest\" ADD COLUMN body text NOT NULL DEFAULT ''`},")
        }); 
        it('should render drop', function() {
            return ejs.renderFile(filename, {"name":"TableTest","field": columns[1].field,"drop": "DEFAULT", "alterCase":"AlterColumn"}).should.eventually
                .equalIgnoreSpaces("{tableName: \"TableTest\", text: `ALTER TABLE \"TableTest\" ALTER COLUMN body DROP DEFAULT`},")
        }); 
    })
    describe('partials/queriesConstraint', function() {
        const filename = './generators/app/templates/database/partials/queriesConstraint.ejs';
        it('should render empty queries constraint', function() {
            return ejs.renderFile(filename, {"tables": tables2}).should.eventually.equalIgnoreSpaces("const queriesConstraint = []")
        });
        it('should render queries constraint', function() {
            return ejs.renderFile(filename, {"tables": tables}).should.eventually
                .equalIgnoreSpaces("const queriesConstraint = [{tableName: \"table_test\", text: `ALTER TABLE \"table_test\" ADD FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\") DEFERRABLE INITIALLY DEFERRED`},]")
        });
    })
    describe('partials/queriesAddFields', function() {
        const filename = './generators/app/templates/database/partials/queriesAddFields.ejs';
        it('should render add column', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","sqlname" : "field_test","column" : columns[0]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"field_test\", text: `ALTER TABLE \"field_test\" ADD COLUMN Pk_Tweet_id Int`},]")
        });
        it('should render add column with FK', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","sqlname" : "field_test","column" : columns[3]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"field_test\", text: `ALTER TABLE \"field_test\" ADD COLUMN Fk_User_id Int`},"
                    + "{tableName: \"field_test\", text: `ALTER TABLE \"field_test\" ADD FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\") DEFERRABLE INITIALLY DEFERRED`},]")
        });
        
        it('should render add not null column', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","sqlname" : "field_test","column" : columns[2]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"field_test\", text: `ALTER TABLE \"field_test\" ADD COLUMN date timestamp NOT NULL DEFAULT TO_TIMESTAMP('1970-01-01 01:00:00','YYYY-MM-DD HH:MI:SS')`},"
                    + "{tableName: \"field_test\", text: `ALTER TABLE \"field_test\" ALTER COLUMN date DROP DEFAULT`},]")
        });
    })
    describe('partials/queriesDeleteFields', function() {
        const filename = './generators/app/templates/database/partials/queriesDeleteFields.ejs';
        it('should render delete fields', function() {
            return ejs.renderFile(filename, {"fields": deleteFields}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal(("const queriesDeleteFields = [ {tableName : \"User\" , text: `ALTER TABLE \"user\" DROP COLUMN IF EXISTS firstname`}, "
                + "{tableName : \"User\" , text: `ALTER TABLE \"user\" DROP COLUMN IF EXISTS lastname`}, ]").replace(/\s\s+/g, ' '))})
        });
    })
    describe('partials/defaultVal', function() {
        const filename = './generators/app/templates/database/partials/defaultVal.ejs';
        it('should render default value for String', function() {
            return ejs.renderFile(filename, {"type": "String"}).should.eventually.equal("\'\'")
        });
        it('should render default value for nothing', function() {
            return ejs.renderFile(filename, {"type": "nothing"}).should.eventually.equal("undefined")
        });
    })
    describe('partials/initType', function() {
        const filename = './generators/app/templates/database/partials/initType.ejs';
        it('should render init type for text', function() {
            return ejs.renderFile(filename, {"type": "text"}).should.eventually.equal("\'\'")
        });
        it('should render init type for Int', function() {
            return ejs.renderFile(filename, {"type": "Int"}).should.eventually.equal("0")
        });
    })
    describe('partials/queriesUpdateFields', function() {
        const filename = './generators/app/templates/database/partials/queriesUpdateFields.ejs';
        it('should render update fields', function() {
            return ejs.renderFile(filename, {"fields": updateFields}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal("const queriesUpdateFields = [ {tableName: \"user\", text: `UPDATE \"user\" SET \"username\" = '' WHERE \"username\" IS NULL;`}, "
                                                                                        +"{tableName: \"user\", text: `ALTER TABLE \"user\" ALTER COLUMN \"username\" SET NOT NULL ;`}, ]")})
        });
    })
    describe('partials/scalars', function() {
        const filename = './generators/app/templates/database/partials/scalars.ejs';
        it('should render scalar for ID ', function() {
            return ejs.renderFile(filename, {"field": fields[0],"scalars": scalars}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal("if(args.id !== undefined){ temp += args.id ? \"\\\"id\\\" = \'\" + utils.escapeQuote(args.id) + \"\', \" : \"\\\" id\\\" = null, \" } ")})
        });
        it('should render scalar for title ', function() {
            return ejs.renderFile(filename, {"field": fields[1],"scalars": scalars}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal("if(args.title !== undefined){ temp += args.title ? \"\\\"title\\\" = \'\" + utils.escapeQuote(args.title) + \"\', \" : \"\\\" title\\\" = null, \" } ")})
        });
    })
    describe('partials/getRelationBetween', function() {
        const filename = './generators/app/templates/database/partials/getRelationBetween.ejs';
        it('should render relation manyToMany ', function() {
            return ejs.renderFile(filename, {"typeOne": fields[0].type,"typeTwo": "Movie",relations: relations }).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal(" manyToMany ")})
        });
    })
    describe('partials/getManyToMany', function() {
        const filename = './generators/app/templates/database/partials/getManyToManyTableBetween.ejs';
        it('should render manyToMany table between', function() {
            return ejs.renderFile(filename, {"typeOne": "Actor","typeTwo": "Movie","manyToManyTables":manyToManyTables}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal(JSON.stringify(manyToManyTables[0])+' ')
            })
        })
    })
    describe('partials/updateMethodsField', function() {
        const filename = './generators/app/templates/database/partials/updateMethodsField.ejs';
        it('should render fields update methods ', function() {
            return ejs.renderFile(filename, {"fields": fields, "relations":relations, "manyToManyTables":manyToManyTables, "scalarTypeNames":scalarTypeNames, "scalars":scalars, "typeName":"Movie", "sqlTypeName":"movie"}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal("let temp = '' " 
                    + "if(args.title !== undefined){ "
                    + "temp += args.title ? \"\\\"title\\\" = \'\" + utils.escapeQuote(args.title) + \"', \" : \"\\\" title\\\" = null, \" } "
                    + "// Field actors of type Actor "
                    + "sqlParams.sql = \"SELECT * FROM \\\"actor\\\" INNER JOIN \\\" Actor_Movie \\\" ON \\\"Pk_Actor_id\\\" = \\\"Actor_Movie\\\".\\\"Actor_id\\\" INNER JOIN \\\"Movie\\\" ON \\\"Pk_Movie_id\\\" = \\\" Actor_Movie\\\".\\\"Movie_id\\\" WHERE \\\"Pk_Movie_id\\\" = \" + args.id "
                    + "rdsDataService.executeStatement(sqlParams, (err, data) => { if (err) {console.log(err, err.stack)} else { let currentActorState = utils.constructOutputArray(data, \"Actor\") "
                    + "// Actor to add "
                    + "let addedElementsActor = utils.getAddedElements(currentActorState, args.actors) "
                    + "rdsDataService.beginTransaction(beginParams, function (err, data) { if (err) console.log(err, err.stack); "
                    + "// an error occurred else { for (let index = 0; index < addedElementsActor.length; index++) { sqlParams.sql = \"INSERT INTO \\\"Actor_Movie\\\" (\\\"Movie_id\\\", \\\"Actor_id\\\") VALUES (\"+ args.id +\", \"+ addedElementsActor[index]+\")\" "
                    + "rdsDataService.executeStatement(sqlParams, (err, data) => { if (err) console.log(err, err.stack); else console.log(data); }) } "
                    + "commitParams.transactionId = data.transactionId rdsDataService.commitTransaction(commitParams, function (err, data) { if (err) console.log(err, err.stack); // an error occurred else console.log(data) }) } }); "
                    + "// Actor to delete "
                    + "let removedElementsActor = utils.getRemovedElements(currentActorState, args.actors) rdsDataService.beginTransaction(beginParams, function (err, data) { if (err) console.log(err, err.stack); // an error occurred else { "
                    + "for (let index = 0; index < removedElementsActor.length; index++) { sqlParams.sql = \"DELETE FROM \\\"Actor_Movie\\\" WHERE \\\"Actor_id\\\" = \" + removedElementsActor[index] + \" AND \\\"Movie_id\\\" = \" + args.id "
                    + "rdsDataService.executeStatement(sqlParams, (err, data) => { if (err) console.log(err, err.stack); else console.log(data); }) } commitParams.transactionId = data.transactionId rdsDataService.commitTransaction(commitParams, function (err, data) { if (err) console.log(err, err.stack); // an error occurred else console.log(data) }) } }) } }) "
                )})
        });
    })
    
});
