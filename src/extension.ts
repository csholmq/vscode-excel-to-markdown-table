'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var clipboard = require("copy-paste");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "excel-to-markdown-table" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => {
        // The code you place here will be executed every time your command is executed
        clipboard.paste(excelToMarkdown);
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
    return true
}

function excelToMarkdown(err, rawData) {
    let data = rawData.trim()
    
    if (!looksLikeTable(data)) {
        vscode.commands.executeCommand('editor.action.clipboardPasteAction')
    }

    var rows = data.split((/[\n\u0085\u2028\u2029]|\r\n?/g)).map(function (row) {
        return row.split("\t")
    })

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
        row.map

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

    // Copy formatted data to clipboard before calling normal paste action
    // Afterwards, replace clipboard data with original content
    clipboard.copy(markdownRows.join("\n"), function () {
        vscode.commands.executeCommand('editor.action.clipboardPasteAction')
        clipboard.copy(rawData)
    })
    

    return 
}
