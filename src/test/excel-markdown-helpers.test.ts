
import * as assert from 'assert';

import * as hlp from '../excel-markdown-helpers';
import { TableSizeMetadata } from '../interfaces';

suite('Helper Tests', () => {
    suite('columnWidth', () => {
        test("columnWidth", () => {
            const row = [["first", "second"]];

            assert.equal(hlp.columnWidth(row, 0), 5);
            assert.equal(hlp.columnWidth(row, 1), 6);
        });
    });

    suite('splitIntoRowsAndColumns', () => {
        test("splitIntoRowsAndColumns", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond"), [["first", "second"]]), "Basic split not working";
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\t\t"), [["first", "second", "", ""]], "Should add empty tabs as columns");
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\r\nnew\trow"),[["first","second"],["new","row"]]);
        });
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


    suite('addAligmnetSyntax', () => {
        test("addAligmnetSyntax", () => {
            assert.deepEqual(hlp.addAlignmentSyntax(["test"], [5], []), [ 'test', '|-------|' ]);
        });
    });


    suite('calculateAlignmentMarkdownSyntaxMetadata', () => {
        test('should get markdown syntax for valid alignment characters', () => {
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('l'), { prefix: '',  postfix: '',  adjust: 0 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('c'), { prefix: ':', postfix: ':', adjust: 2 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('r'), { prefix: '',  postfix: ':', adjust: 1 });
        });

        test('should get default let-aligned markdown syntax for non-valid alignment characters', () => {
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('x'), { prefix: '', postfix: '', adjust: 0 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('?'), { prefix: '', postfix: '', adjust: 0 });
        });
    });

    suite('getColumnWidthsAndAlignments', () => {
        test('should get widths and alignment for single row of data', () => {
            let rows = [['test', 'column']];
            let expected: TableSizeMetadata = {
                columnWidths: [4,6],
                colAlignments: ['l', 'l']
            }
            assert.deepEqual(hlp.getColumnWidthsAndAlignments(rows), expected);
        });

        test('should get widths and alignment for multiple rows of data', () => {
            let rows = [['^ltest', '^ccolumn', '^rright', '^xinvalid'], [ 'x', 'longstring', '', '123' ]];
            let expected: TableSizeMetadata = {
                columnWidths: [4,10, 5, 9],
                colAlignments: ['l', 'c', 'r', 'l']
            }
            assert.deepEqual(hlp.getColumnWidthsAndAlignments(rows), expected);
        });
    });

    suite('columnAlignment', () => {
        test('should get correct alignment for valid alignment characters', () => {
            assert.equal(hlp.columnAlignment('^ltext'), 'l');
            assert.equal(hlp.columnAlignment('^ctext'), 'c');
            assert.equal(hlp.columnAlignment('^rtext'), 'r');

        });

        test('should get default left alignment for non-valid alignment characters', () => {
            assert.equal(hlp.columnAlignment('^xtext'), 'l');
            assert.equal(hlp.columnAlignment('^?text'), 'l');
        });
    });

    suite('columnAlignmentFromChar', () => {
        test('should get correct alignment character for valid input', () => {
            assert.equal(hlp.columnAlignmentFromChar('l'), 'l');
            assert.equal(hlp.columnAlignmentFromChar('c'), 'c');
            assert.equal(hlp.columnAlignmentFromChar('r'), 'r');
        });

        test('should get default left alignment for non valid input', () => {
            assert.equal(hlp.columnAlignmentFromChar('x'), 'l');
            assert.equal(hlp.columnAlignmentFromChar('?'), 'l');
        });
    });

});
