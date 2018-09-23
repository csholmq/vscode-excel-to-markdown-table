
import * as assert from 'assert';

import * as hlp from '../excel-markdown-helpers';

suite('Helper Tests', () => {
    test("columnWidth", () => {
        const row = [["first", "second"]];

        assert.equal(hlp.columnWidth(row, 0), 5);
        assert.equal(hlp.columnWidth(row, 1), 6);
    });

    test("splitIntoRowsAndColumns", () => {
        assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond"), [["first", "second"]]), "Basic split not working";
        assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\t\t"), [["first", "second", "", ""]], "Should add empty tabs as columns");
        assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\r\nnew\trow"),[["first","second"],["new","row"]]);
    });

    suite("addMarkdownSyntax", () => {
        
        test('should generate header for single column', () => {
            assert.equal(hlp.addMarkdownSyntax([["test"]], [4]), "| test |");
        });

        test('should generate header for multiple columns', () => {
            assert.equal(hlp.addMarkdownSyntax([["test", "column2"]], [4, 7]), "| test | column2 |");
            assert.equal(hlp.addMarkdownSyntax([["test", "column2", "x"]], [4, 7, 1]), "| test | column2 | x |");
        });

        test('should generate header for multiple rows and columns', () => {
            let rows = [
                ["test", "column2"],
                ["123", "test"]
            ];
            let colWidths = [4, 7];
            let expected = [
                "| test | column2 |",
                "| 123  | test    |"
            ];

            let actual = hlp.addMarkdownSyntax(rows, colWidths);
            assert.deepEqual(actual, expected);
        });
        
    });


    test("addAligmnetSyntax", () => {
        assert.deepEqual(hlp.addAlignmentSyntax(["test"], [5], []), [ 'test', '|-------|' ]);
    });
})