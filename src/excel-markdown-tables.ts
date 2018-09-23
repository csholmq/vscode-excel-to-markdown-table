const ALIGNED_LEFT = "l";
const ALIGNED_RIGHT = "r";
const ALIGNED_CENTER = "c";


/**
 * Test fuck
 * @param rawData 
 */
export function excelToMarkdown(rawData: string): string {
    let data = rawData.trim();
    var rows = splitIntoRowsAndColumns(data);
    var {columnWidths, colAlignments } = getColumnWidthsAndAlignments(rows);
    const markdownRows = addMarkdownSyntax(rows, columnWidths);

    return addAlignmentSyntax(markdownRows, columnWidths, colAlignments).join("\n");
}


export function columnWidth(rows: string[][], columnIndex: number) : number{
    return Math.max.apply(null, rows.map(function (row) {
        return (row[columnIndex] && row[columnIndex].length) || 0;
    }))
}


export function addMarkdownSyntax(rows: string[][], columnWidths: any[]) {
    return rows.map(function (row, rowIndex) {
        // | Name         | Title | Email Address  |
        // |--------------|-------|----------------|
        // | Jane Atler   | CEO   | jane@acme.com  |
        // | John Doherty | CTO   | john@acme.com  |
        // | Sally Smith  | CFO   | sally@acme.com |
        return "| " + row.map(function (column, index) {
            return column + Array(columnWidths[index] - column.length + 1).join(" ");
        }).join(" | ") + " |";
    });
}

/**
 * Adds Alignment colons and inserts Header hyphens
 * @param markdownRows
 * @param columnWidths
 * @param colAlignments
 */
export function addAlignmentSyntax(markdownRows: string[], columnWidths: number[], colAlignments: string[]):string[] {
    let result = Object.assign([], markdownRows); // Deepcopy: https://stackoverflow.com/questions/35504310/deep-copy-an-array-in-angular-2-typescript#35504348
    result.splice(1, 0, "|" + columnWidths.map(function (width, index) {
        var prefix = "";
        var postfix = "";
        var adjust = 0;
        var alignment = colAlignments[index];
        if (alignment === "r") {
            postfix = ":";
            adjust = 1;
        }
        else if (alignment == "c") {
            prefix = ":";
            postfix = ":";
            adjust = 2;
        }
        return prefix + Array(columnWidths[index] + 3 - adjust).join("-") + postfix;
    }).join("|") + "|");
    return result;
}

function getColumnWidthsAndAlignments(rows: string[][]) : {columnWidths:number[], colAlignments: string[]}{
    let colAlignments: string[]=[];
    return {
        columnWidths: rows[0].map(function (column, columnIndex) {
            var alignment = ALIGNED_LEFT;
            var re = /^(\^[lcr])/i;
            var m = column.match(re);

            if (m) {
                var align = m[1][1].toLowerCase();
                if (align === ALIGNED_CENTER) {
                    alignment = ALIGNED_CENTER;
                }
                else if (align === ALIGNED_RIGHT) {
                    alignment = ALIGNED_RIGHT;
                }
            }

            colAlignments.push(alignment);
            column = column.replace(re, "");
            rows[0][columnIndex] = column;
            return columnWidth(rows, columnIndex);
        }),
        colAlignments: colAlignments
    };
}

export function splitIntoRowsAndColumns(data: string):string[][] {
    // UNI_NEXT_LINE = '\u0085'
    // UNI_LINE_SEPARATOR = '\u2028'
    // UNI_PARAGRAPH_SEPARATOR = `\u2029`

    // Split rows on newline
    var rows = data.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(function (row) {
        // Split columns on tab
        return row.split("\t");
    });

    return rows;
}
