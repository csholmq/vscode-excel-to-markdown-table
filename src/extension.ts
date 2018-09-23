'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {excelToMarkdown} from './excel-markdown-tables'


export function activate(context: vscode.ExtensionContext) {
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => {
        let clipboard = require("copy-paste");

        clipboard.paste(function(err, val) {
            pasteText(val);
        });
    });

    context.subscriptions.push(disposable);
}



// this method is called when your extension is deactivated
export function deactivate() {
}


function pasteText(rawData: string) {
    let clipboard = require('copy-paste');

    let paste = excelToMarkdown(rawData);

    // Copy formatted data to clipboard before calling normal paste action
    // Afterwards, replace clipboard data with original content
    clipboard.copy(paste, function () {
        vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        clipboard.copy(rawData);
    })
}