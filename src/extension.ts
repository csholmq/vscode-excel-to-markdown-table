'use strict';

import * as vscode from 'vscode';
import {excelToMarkdown} from './excel-markdown-tables'

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.excelToMarkdown', async () => {
        const text = await vscode.env.clipboard.readText();
        pasteText(text);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function pasteText(rawData: string) {
    const paste = excelToMarkdown(rawData);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    editor.edit(_ => _.replace(editor.selection, paste));
}
