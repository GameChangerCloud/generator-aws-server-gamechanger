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
});
