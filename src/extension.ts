'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const ALIGNED_LEFT = "l";
const ALIGNED_RIGHT = "r";
const ALIGHED_CENTER = "c";

export interface excelToMarkDownObj {
    isTable: boolean,
    markdownData: string|null
};

export function activate(context: vscode.ExtensionContext) {
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => {
        let clipboard = require("copy-paste");

        clipboard.paste(function(err, val) {
            pasteText(val);
        });
    });

    context.subscriptions.push(disposable);
}

function pasteText(rawData: string) {
    let clipboard = require("copy-paste");
    let paste = excelToMarkdown(rawData);

    if(paste.isTable) {
        // Copy formatted data to clipboard before calling normal paste action
        // Afterwards, replace clipboard data with original content
        clipboard.copy(paste.markdownData, function () {
            console.info(`Pasting: ${paste.markdownData}`);
            vscode.commands.executeCommand('editor.action.clipboardPasteAction')
            clipboard.copy(rawData)
        })
    } else {
        vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export function columnWidth(rows: string[][], columnIndex: number) {
    return Math.max.apply(null, rows.map(function (row) {
        return (row[columnIndex] && row[columnIndex].length) || 0;
    }))
}

/**
 *
 * @param rawData
 * If isTable returns false, markdownData will be empty
 */
export function excelToMarkdown(rawData: string): excelToMarkDownObj {
    let data = rawData.trim()
    var rows = splitIntoRowsAndColumns(data);

    var colAlignments = [];

    var columnWidths = getColumnWidths(rows, colAlignments)

    var markdownRows = rows.map(function (row, rowIndex) {
        // | Name         | Title | Email Address  |
        // |--------------|-------|----------------|
        // | Jane Atler   | CEO   | jane@acme.com  |
        // | John Doherty | CTO   | john@acme.com  |
        // | Sally Smith  | CFO   | sally@acme.com |
        return "| " + row.map(function (column, index) {
            return column + Array(columnWidths[index] - column.length + 1).join(" ")
        }).join(" | ") + " |"

    })

    markdownRows.splice(1, 0, "|" + columnWidths.map(function (width, index) {
        var prefix = ""
        var postfix = ""
        var adjust = 0
        var alignment = colAlignments[index]
        if (alignment === "r") {
            postfix = ":"
            adjust = 1
        } else if (alignment == "c") {
            prefix = ":"
            postfix = ":"
            adjust = 2
        }
        return prefix + Array(columnWidths[index] + 3 - adjust).join("-") + postfix
    }).join("|") + "|")

    return {
        isTable: true,
        markdownData: markdownRows.join("\n")
    }
}

function getColumnWidths(rows: string[][], colAlignments: any[]) {
    return rows[0].map(function (column, columnIndex) {
        var alignment = ALIGNED_LEFT;
        var re = /^(\^[lcr])/i;
        var m = column.match(re);

        if (m) {
            var align = m[1][1].toLowerCase();
            if (align === ALIGHED_CENTER) {
                alignment = ALIGHED_CENTER;
            }
            else if (align === ALIGNED_RIGHT) {
                alignment = ALIGNED_RIGHT;
            }
        }

        colAlignments.push(alignment);
        column = column.replace(re, "");
        rows[0][columnIndex] = column;
        return columnWidth(rows, columnIndex);
    });
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

