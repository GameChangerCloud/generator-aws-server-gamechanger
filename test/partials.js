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
//Without Foreign key
const columns2 = [
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
        "columns" : columns
    }
]
//Using columns 2
const tables2 = [
    {
        "name" : "TableTest",
        "columns" : columns2
    }
]

const deleteFields = [
    { name: 'User', column: 'firstname' },
    { name: 'User', column: 'lastname' },  
]

const updateFields = [
    {
        name: 'User',
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
        const awaited = '`'+resultColumns.join(',').replace(/\s+/g, '')+'`';
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
    //veyrack's part
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
                .equalIgnoreSpaces("const queriesConstraint = [{tableName: \"TableTest\", text: `ALTER TABLE \"TableTest\" ADD FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\") DEFERRABLE INITIALLY DEFERRED`},]")
        });
    })
    describe('partials/queriesAddFields', function() {
        const filename = './generators/app/templates/database/partials/queriesAddFields.ejs';
        it('should render add column', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","column" : columns[0]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"FieldTest\", text: `ALTER TABLE \"FieldTest\" ADD COLUMN Pk_Tweet_id Int`},]")
        });
        it('should render add column with FK', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","column" : columns[3]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"FieldTest\", text: `ALTER TABLE \"FieldTest\" ADD COLUMN Fk_User_id Int`},"
                    + "{tableName: \"FieldTest\", text: `ALTER TABLE \"FieldTest\" ADD FOREIGN KEY (\"Fk_User_id\") REFERENCES \"User\" (\"Pk_User_id\") DEFERRABLE INITIALLY DEFERRED`},]")
        });
        
        it('should render add not null column', function() {
            return ejs.renderFile(filename, {"fields": [{"name" : "FieldTest","column" : columns[2]}]}).should.eventually
                .equalIgnoreSpaces("const queriesAddFields = [{tableName: \"FieldTest\", text: `ALTER TABLE \"FieldTest\" ADD COLUMN date timestamp NOT NULL DEFAULT TO_TIMESTAMP('1970-01-01 01:00:00','YYYY-MM-DD HH:MI:SS')`},"
                    + "{tableName: \"FieldTest\", text: `ALTER TABLE \"FieldTest\" ALTER COLUMN date DROP DEFAULT`},]")
        });
    })
    describe('partials/queriesDeleteFields', function() {
        const filename = './generators/app/templates/database/partials/queriesDeleteFields.ejs';
        it('should render delete fields', function() {
            return ejs.renderFile(filename, {"fields": deleteFields}).then(result => {
                result.replace(/\s\s+/g, ' ').should.equal(("const queriesDeleteFields = [ {tableName : \"User\" , text: `ALTER TABLE \"User\" DROP COLUMN IF EXISTS firstname`}, "
                + "{tableName : \"User\" , text: `ALTER TABLE \"User\" DROP COLUMN IF EXISTS lastname`}, ]").replace(/\s\s+/g, ' '))})
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
                result.replace(/\s\s+/g, ' ').should.equal("const queriesUpdateFields = [ {tableName: \"User\", text: `UPDATE \"User\" SET \"username\" = '' WHERE \"username\" IS NULL;`}, "
                                                                                        +"{tableName: \"User\", text: `ALTER TABLE \"User\" ALTER COLUMN \"username\" SET NOT NULL ;`}, ]")})
        });
    })
});
