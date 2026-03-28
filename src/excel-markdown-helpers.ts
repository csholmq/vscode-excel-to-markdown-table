import { TableCellAlignment, TableSizeMetadata } from './interfaces'
import { ALIGNED_LEFT_SYNTAX, ALIGNED_CENTER_SYNTAX, ALIGNED_RIGHT_SYNTAX } from './table-alignment-syntax'

const ALIGNED_LEFT = "l";
const ALIGNED_RIGHT = "r";
const ALIGNED_CENTER = "c";
const EXCEL_COLUMN_DELIMITER = "\t";
const MARKDOWN_NEWLINE = "<br/>";
const UNESCAPED_DOUBLE_QUOTE = '"';

// UNI_NEXT_LINE = '\u0085'
// UNI_LINE_SEPARATOR = '\u2028'
// UNI_PARAGRAPH_SEPARATOR = `\u2029`
const EXCEL_ROW_DELIMITER_REGEX = /[\n\u0085\u2028\u2029]|\r\n?/g
const COLUMN_ALIGNMENT_REGEX = /^(\^[lcr])/i;
const EXCEL_NEWLINE_ESCAPED_CELL_REGEX = /"([^\t]*(?<=[^\r])\n[^\t]*)"/g;
const EXCEL_NEWLINE_REGEX = /\n/g;
const EXCEL_DOUBLE_QUOTE_ESCAPED_REGEX = /""/g;

/**
 * Apply markdown syntax to create padded cells for each row of data in the table
 * @param rows Rows of text data
 * @param columnWidths Width of each column in the destination table
 */
export function addMarkdownSyntax(rows: string[][], columnWidths: number[]) {
    return rows.map(function (row, rowIndex) {
        return "| " + columnWidths.map(function (width, index) {
            const cell = (row[index] !== undefined) ? row[index] : "";
            return cell + " ".repeat(width - cell.length);
        }).join(" | ") + " |";
    });
}

/**
 * Adds Alignment colons and inserts Header hyphens
 * @param markdownRows Each row in the markdown output table
 * @param columnWidths Padded widths for each column
 * @param colAlignments Alignments for each cell's text (l = left, c = center, r = right)
 */
export function addAlignmentSyntax(markdownRows: string[], columnWidths: number[], colAlignments: string[]):string[] {
    const result = [...markdownRows];

    result.splice(1, 0,
        "|" + columnWidths.map(function (width, index) {
            const {prefix, postfix, adjust} = calculateAlignmentMarkdownSyntaxMetadata(colAlignments[index]);
            return prefix + "-".repeat(width + 2 - adjust) + postfix;
        }).join("|") + "|");
    return result;
}

/**
 * Derives the Markdown Alignment syntax metadata on how to align the cell text
 * @param alignment The cell text alignment (l = left, c = center, r = right)
 */
export function calculateAlignmentMarkdownSyntaxMetadata(alignment: string) : TableCellAlignment {

    switch (alignment) {
        case ALIGNED_LEFT: return ALIGNED_LEFT_SYNTAX
        case ALIGNED_CENTER: return ALIGNED_CENTER_SYNTAX
        case ALIGNED_RIGHT: return ALIGNED_RIGHT_SYNTAX
        default: return ALIGNED_LEFT_SYNTAX
    }
}

/**
 * Derives alignments from excel table data and calculates
 * column padding for each column
 * @param rows Table of data from Excel
 */
export function getColumnWidthsAndAlignments(rows: string[][]) : TableSizeMetadata {
    const colAlignments: string[]=[];
    const headerRow = [...rows[0]];
    return {
        columnWidths: headerRow.map(function (column, columnIndex) {
            const alignment = columnAlignment(column);
            colAlignments.push(alignment);

            // Strip alignment prefix from header text
            const cleanedColumn = column.replace(COLUMN_ALIGNMENT_REGEX, "");
            rows[0][columnIndex] = cleanedColumn;

            return columnWidth(rows, columnIndex);
        }),
        colAlignments: colAlignments
    };
}

/**
 * Maps the original header alignment to an internal alignment
 * @param columnHeaderText The original Excel column header text
 */
export function columnAlignment(columnHeaderText: string): string {

    const m = columnHeaderText.match(COLUMN_ALIGNMENT_REGEX);

    if (m) {
        const alignChar = m[1][1].toLowerCase();
        return columnAlignmentFromChar(alignChar);
    }

    return ALIGNED_LEFT;
}

/**
 * Maps the original column alignment to an internal alignment
 * @param alignChar Alignment character (l = left, c = center, r = right)
 */
export function columnAlignmentFromChar(alignChar: string) {
    switch (alignChar) {
        case ALIGNED_LEFT: return ALIGNED_LEFT;
        case ALIGNED_CENTER: return ALIGNED_CENTER;
        case ALIGNED_RIGHT: return ALIGNED_RIGHT;
        default: return ALIGNED_LEFT
    }
}

/**
 * Calculates the max content length across all rows of the table
 * for the given column index
 * @param rows All rows of the original Excel table
 * @param columnIndex The column index to calculate the length for
 */
export function columnWidth(rows: string[][], columnIndex: number) : number{
    return Math.max.apply(null, rows.map(function (row) {
        return (row[columnIndex] && row[columnIndex].length) || 0;
    }))
}

/**
 * Takes the raw clipboard content and creates a table-like structure from the data
 * @param data The raw content from the clipboard
 */
export function splitIntoRowsAndColumns(data: string):string[][] {
    const rows = data.split(EXCEL_ROW_DELIMITER_REGEX).map(function (row) {
        return row.split(EXCEL_COLUMN_DELIMITER);
    });

    return rows;
}

/**
 * Replace an intra-cell-newlines
 * @param data The raw content from the Excel via the clipboard
 * @see https://github.com/csholmq/vscode-excel-to-markdown-table/issues/3
 */
export function replaceIntraCellNewline(data: string):string {
    const cellReplacer = (_match: string, group: string) =>
        group.replace(EXCEL_DOUBLE_QUOTE_ESCAPED_REGEX, UNESCAPED_DOUBLE_QUOTE)
             .replace(EXCEL_NEWLINE_REGEX, MARKDOWN_NEWLINE);
    return data.replace(EXCEL_NEWLINE_ESCAPED_CELL_REGEX, cellReplacer);
}
