//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {
    test("columnWidth", () => {
        const row = [["first", "second"]];

        assert.equal(myExtension.columnWidth(row, 0), 5);
        assert.equal(myExtension.columnWidth(row, 1), 6);
    });

    test("splitIntoRowsAndColumns", () => {
        assert.deepEqual(myExtension.splitIntoRowsAndColumns("first\tsecond"), [["first", "second"]]), "Basic split not working";
        assert.deepEqual(myExtension.splitIntoRowsAndColumns("first\tsecond\t\t"), [["first", "second", "", ""]], "Should add empty tabs as columns");
        assert.deepEqual(myExtension.splitIntoRowsAndColumns("first\tsecond\r\nnew\trow"),[["first","second"],["new","row"]]);
    });

    test("excelToMarkdown", () => {
        assert.equal(myExtension.excelToMarkdown("test").markdownData, "| test |\n|------|");
        assert.equal(myExtension.excelToMarkdown("one\ttwo\r\nthree").markdownData,"| one   | two |\n|-------|-----|\n| three |");
    });
});