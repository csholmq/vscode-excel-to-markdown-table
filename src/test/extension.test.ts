//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as emt from '../excel-markdown-tables';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {
    test("columnWidth", () => {
        const row = [["first", "second"]];

        assert.equal(emt.columnWidth(row, 0), 5);
        assert.equal(emt.columnWidth(row, 1), 6);
    });

    test("splitIntoRowsAndColumns", () => {
        assert.deepEqual(emt.splitIntoRowsAndColumns("first\tsecond"), [["first", "second"]]), "Basic split not working";
        assert.deepEqual(emt.splitIntoRowsAndColumns("first\tsecond\t\t"), [["first", "second", "", ""]], "Should add empty tabs as columns");
        assert.deepEqual(emt.splitIntoRowsAndColumns("first\tsecond\r\nnew\trow"),[["first","second"],["new","row"]]);
    });

    test("addMarkdownSyntax", () => {
        assert.equal(emt.addMarkdownSyntax([["test"]], [4]), "| test |");
    });

    test("addAligmnetSyntax", () => {
        assert.deepEqual(emt.addAlignmentSyntax(["test"], [5], []), [ 'test', '|-------|' ]);
    });

    test("excelToMarkdown", () => {
        assert.equal(emt.excelToMarkdown("test"), "| test |\n|------|");
        assert.equal(emt.excelToMarkdown("one\ttwo\r\nthree"),"| one   | two |\n|-------|-----|\n| three |");
    });

    test("excelToMarkdown - Alignment", () => {
        assert.equal(emt.excelToMarkdown("^rtest"), "| test |\n|-----:|");
        assert.equal(emt.excelToMarkdown("^ctest"), "| test |\n|:----:|");
        assert.equal(emt.excelToMarkdown("^ltest"), "| test |\n|------|");
    });
});