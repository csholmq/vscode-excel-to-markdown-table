'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {excelToMarkdown} from './excel-markdown-tables'


/**
 * Registers the extension with VS Code
 * This extension will run when the editor's language is set to 'markdown'.
 * The extension can be called through Ctrl-Shift-P and selecting the XXX Option,
 * or by using the shortcut Shift-Alt-V
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', async () => {
        const text = await vscode.env.clipboard.readText();
        pasteText(text);
    });

    context.subscriptions.push(disposable);
}



// this method is called when your extension is deactivated
export function deactivate() {
}


/**
 * Converts the clipboard contents to a markdown table and pastes into the document
 * @param rawData The raw clipboard contents containing the excel table to convert
 */
function pasteText(rawData: string) {

    let paste = excelToMarkdown(rawData);

    let editor = vscode.window.activeTextEditor;
    editor.edit(_ => _.replace(editor.selection, paste));
}
