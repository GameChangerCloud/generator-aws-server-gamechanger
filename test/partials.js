var ejs = require('ejs');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
 
chai.use(chaiAsPromised);
var should = chai.should();

describe('partials', function() {
    describe('partials/column', function() {
        let filename = './generators/app/templates/database/partials/column.ejs';
        let columns = [
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
        let results = [
            '"Pk_Tweet_id" Int PRIMARY KEY NOT NULL',
            '"body" text',
            '"date" timestamp',
            '"Fk_User_id" Int'
        ]
        it('should render PK database field', function() {
            return ejs.renderFile(filename, {"column": columns[0]}).should.eventually.equal(results[0]);
        });
        it('should render simple text field', function() {
            return ejs.renderFile(filename, {"column": columns[1]}).should.eventually.equal(results[1]);
        });
        it('should render simple date field', function() {
            return ejs.renderFile(filename, {"column": columns[2]}).should.eventually.equal(results[2]);
        });
        it('should render Foreign key field', function() {
            return ejs.renderFile(filename, {"column": columns[3]}).should.eventually.equal(results[3]);
        });
    });
    describe('partials/columns', function() {
        let filename = './generators/app/templates/database/partials/columns.ejs';

    });
    describe('partials/requireByEntity', function() {
        let filename = './generators/app/templates/database/partials/requireByEntity.ejs';
        it('should render require for Tweet', function() {
            return ejs.renderFile(filename, {"entity": "Tweet"}).should.eventually.equal("const handlerTweet = require(\'./handlers/handlerTweet\')");
        });
    });
});
