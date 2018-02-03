'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "excel-to-markdown-table" is now active!');
    
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => {
        let clipboard = require("copy-paste");
        
        let rawData = clipboard.paste();
        let paste = excelToMarkdown(rawData);

        if(paste.isTable) {
            // Copy formatted data to clipboard before calling normal paste action
            // Afterwards, replace clipboard data with original content
            clipboard.copy(paste.markdownData, function () {
                vscode.commands.executeCommand('editor.action.clipboardPasteAction')
                clipboard.copy(rawData)
            })        
        } else {
            vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function columnWidth(rows, columnIndex) {
    return Math.max.apply(null, rows.map(function (row) {
        return row[columnIndex].length
    }))
}

function looksLikeTable(data) {
    let isTable = true
    let prevLen = data[0].length
    
    data.forEach(row => {
        isTable = (row.length == prevLen) && isTable
        prevLen = row.length
    });
    
    isTable = data.length > 1 && isTable

    return isTable
}

function excelToMarkdown(rawData) {
    let data = rawData.trim()
    
    var rows = data.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(function (row) {
        return row.split("\t")
    })
    
    if(!looksLikeTable(rows)) 
        return { isTable: false }
    
    var colAlignments = []
    
    var columnWidths = rows[0].map(function (column, columnIndex) {
        var alignment = "l"
        var re = /^(\^[lcr])/i
        var m = column.match(re)
        if (m) {
            var align = m[1][1].toLowerCase()
            if (align === "c") {
                alignment = "c"
            } else if (align === "r") {
                alignment = "r"
            }
        }
        colAlignments.push(alignment)
        column = column.replace(re, "")
        rows[0][columnIndex] = column
        return columnWidth(rows, columnIndex)
    })
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
