import * as helper from './excel-markdown-helpers';

const LINE_ENDING = "\n"

/**
 * Converts a string payload into a Markdown formatted table
 * @param rawData A table-like string
 */
export function excelToMarkdown(rawData: string): string {
    const data = rawData.trim();
    const intraCellNewlineReplacedData = helper.replaceIntraCellNewline(data)
    const rows = helper.splitIntoRowsAndColumns(intraCellNewlineReplacedData);
    const {columnWidths, colAlignments } = helper.getColumnWidthsAndAlignments(rows);
    const markdownRows = helper.addMarkdownSyntax(rows, columnWidths);

    return helper.addAlignmentSyntax(markdownRows, columnWidths, colAlignments).join(LINE_ENDING);
}
