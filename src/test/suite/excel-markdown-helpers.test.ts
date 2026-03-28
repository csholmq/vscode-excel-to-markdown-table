
import * as assert from 'assert';

import * as hlp from '../../excel-markdown-helpers';
import { TableSizeMetadata } from '../../interfaces';

describe('Helper Tests', () => {
    describe('columnWidth', () => {
        it("columnWidth", () => {
            const row = [["first", "second"]];

            assert.equal(hlp.columnWidth(row, 0), 5);
            assert.equal(hlp.columnWidth(row, 1), 6);
        });

        it("should return 0 for a column index beyond the row length", () => {
            const rows = [["a"], ["b"]];
            assert.equal(hlp.columnWidth(rows, 1), 0);
        });

        it("should return max width across multiple rows", () => {
            const rows = [["short", "x"], ["longervalue", "yy"]];
            assert.equal(hlp.columnWidth(rows, 0), 11);
            assert.equal(hlp.columnWidth(rows, 1), 2);
        });
    });

    describe('splitIntoRowsAndColumns', () => {
        it("splitIntoRowsAndColumns", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond"), [["first", "second"]]), "Basic split not working";
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\t\t"), [["first", "second", "", ""]], "Should add empty tabs as columns");
            assert.deepEqual(hlp.splitIntoRowsAndColumns("first\tsecond\r\nnew\trow"),[["first","second"],["new","row"]]);
        });

        it("should split on \\n line endings", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("a\tb\nc\td"), [["a","b"],["c","d"]]);
        });

        it("should split on \\r line endings", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("a\tb\rc\td"), [["a","b"],["c","d"]]);
        });

        it("should split on Unicode next line (\\u0085)", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("a\tb\u0085c\td"), [["a","b"],["c","d"]]);
        });

        it("should split on Unicode line separator (\\u2028)", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("a\tb\u2028c\td"), [["a","b"],["c","d"]]);
        });

        it("should split on Unicode paragraph separator (\\u2029)", () => {
            assert.deepEqual(hlp.splitIntoRowsAndColumns("a\tb\u2029c\td"), [["a","b"],["c","d"]]);
        });
    });


    describe("addMarkdownSyntax", () => {

        it('should generate header for single column', () => {
            assert.deepEqual(hlp.addMarkdownSyntax([["test"]], [4]), ["| test |"]);
        });

        it('should generate header for multiple columns', () => {
            assert.deepEqual(hlp.addMarkdownSyntax([["test", "column2"]], [4, 7]), ["| test | column2 |"]);
            assert.deepEqual(hlp.addMarkdownSyntax([["test", "column2", "x"]], [4, 7, 1]), ["| test | column2 | x |"]);
        });

        it('should generate header for multiple rows and columns', () => {
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

        it('should handle rows with fewer columns than header', () => {
            let rows = [
                ["col1", "col2", "col3"],
                ["a", "b"]
            ];
            let colWidths = [4, 4, 4];
            let expected = [
                "| col1 | col2 | col3 |",
                "| a    | b    |      |"
            ];

            let actual = hlp.addMarkdownSyntax(rows, colWidths);
            assert.deepEqual(actual, expected);
        });

        it('should handle completely empty short rows', () => {
            let rows = [
                ["col1", "col2"],
                []
            ];
            let colWidths = [4, 4];
            let expected = [
                "| col1 | col2 |",
                "|      |      |"
            ];

            let actual = hlp.addMarkdownSyntax(rows, colWidths);
            assert.deepEqual(actual, expected);
        });

    });


    describe('addAlignmentSyntax', () => {
        it("should add left-aligned separator by default", () => {
            assert.deepEqual(hlp.addAlignmentSyntax(["test"], [5], []), [ 'test', '|-------|' ]);
        });

        it("should add left-aligned separator", () => {
            assert.deepEqual(hlp.addAlignmentSyntax(["| head |"], [4], ['l']), [ '| head |', '|------|' ]);
        });

        it("should add center-aligned separator", () => {
            assert.deepEqual(hlp.addAlignmentSyntax(["| head |"], [4], ['c']), [ '| head |', '|:----:|' ]);
        });

        it("should add right-aligned separator", () => {
            assert.deepEqual(hlp.addAlignmentSyntax(["| head |"], [4], ['r']), [ '| head |', '|-----:|' ]);
        });

        it("should handle multiple columns with mixed alignments", () => {
            assert.deepEqual(
                hlp.addAlignmentSyntax(["| a | b | c |"], [3, 3, 3], ['l', 'c', 'r']),
                [ '| a | b | c |', '|-----|:---:|----:|' ]
            );
        });
    });


    describe('calculateAlignmentMarkdownSyntaxMetadata', () => {
        it('should get markdown syntax for valid alignment characters', () => {
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('l'), { prefix: '',  postfix: '',  adjust: 0 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('c'), { prefix: ':', postfix: ':', adjust: 2 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('r'), { prefix: '',  postfix: ':', adjust: 1 });
        });

        it('should get default let-aligned markdown syntax for non-valid alignment characters', () => {
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('x'), { prefix: '', postfix: '', adjust: 0 });
            assert.deepEqual(hlp.calculateAlignmentMarkdownSyntaxMetadata('?'), { prefix: '', postfix: '', adjust: 0 });
        });
    });

    describe('getColumnWidthsAndAlignments', () => {
        it('should get widths and alignment for single row of data', () => {
            let rows = [['test', 'column']];
            let expected: TableSizeMetadata = {
                columnWidths: [4,6],
                colAlignments: ['l', 'l']
            }
            assert.deepEqual(hlp.getColumnWidthsAndAlignments(rows), expected);
        });

        it('should get widths and alignment for multiple rows of data', () => {
            let rows = [['^ltest', '^ccolumn', '^rright', '^xinvalid'], [ 'x', 'longstring', '', '123' ]];
            let expected: TableSizeMetadata = {
                columnWidths: [4,10, 5, 9],
                colAlignments: ['l', 'c', 'r', 'l']
            }
            assert.deepEqual(hlp.getColumnWidthsAndAlignments(rows), expected);
        });
    });

    describe('columnAlignment', () => {
        it('should get correct alignment for valid alignment characters', () => {
            assert.equal(hlp.columnAlignment('^ltext'), 'l');
            assert.equal(hlp.columnAlignment('^ctext'), 'c');
            assert.equal(hlp.columnAlignment('^rtext'), 'r');

        });

        it('should get default left alignment for non-valid alignment characters', () => {
            assert.equal(hlp.columnAlignment('^xtext'), 'l');
            assert.equal(hlp.columnAlignment('^?text'), 'l');
        });
    });

    describe('columnAlignmentFromChar', () => {
        it('should get correct alignment character for valid input', () => {
            assert.equal(hlp.columnAlignmentFromChar('l'), 'l');
            assert.equal(hlp.columnAlignmentFromChar('c'), 'c');
            assert.equal(hlp.columnAlignmentFromChar('r'), 'r');
        });

        it('should get default left alignment for non valid input', () => {
            assert.equal(hlp.columnAlignmentFromChar('x'), 'l');
            assert.equal(hlp.columnAlignmentFromChar('?'), 'l');
        });
    });

    describe('replaceIntraCellNewline', () => {
        it('should replace an intra-cell-newline and unescape double quotes correctly', () => {
            let rawData  = '"aaa\tbbb"\tccc\r\n"""dd\nzz"""\t"ee\nff"\t"g"g"';
            let expected = '"aaa\tbbb"\tccc\r\n"dd<br/>zz"\tee<br/>ff\t"g"g"';

            let actual = hlp.replaceIntraCellNewline(rawData);
            assert.deepEqual(actual, expected);
        });

        it('should handle multiple newlines within a single cell', () => {
            assert.equal(hlp.replaceIntraCellNewline('"a\nb\nc"'), 'a<br/>b<br/>c');
        });

        it('should handle cells with only double-quote escaping and no newline', () => {
            // No newline inside quotes means the regex won't match — passes through unchanged
            assert.equal(hlp.replaceIntraCellNewline('"""hello"""'), '"""hello"""');
        });

        it('should leave data without intra-cell newlines unchanged', () => {
            assert.equal(hlp.replaceIntraCellNewline('plain\tdata'), 'plain\tdata');
        });
    });

});
