// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

let clipboard: any;
let previousClipboard: any;

function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
  </head>
  <body>
	  <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    function copyToClipboard() {
        var editor = vscode.window.activeTextEditor;
        var selection = editor!.selection;

        var s = selection.start;
        var e = selection.end;

        var hasSelection = s.line !== e.line || s.character !== e.character;

        if (hasSelection && editor!.selections.length === 1) {
            // previousClipboard = clipboard;
            clipboard = editor!.document.getText(new vscode.Range(s, e));
            previousClipboard = clipboard;
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.copy", function () {
            copyToClipboard();
            var copyCommand = vscode.workspace.getConfiguration("copycat").copyCommand;
            vscode.commands.executeCommand(copyCommand);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.cut", function () {
            copyToClipboard();
            var cutCommand = vscode.workspace.getConfiguration("copycat").cutCommand;
            vscode.commands.executeCommand(cutCommand);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.undo", function () {
            if (previousClipboard) {
                clipboard = previousClipboard;
                vscode.env.clipboard.writeText(previousClipboard);
                previousClipboard = undefined;
            }
            var undoCommand = vscode.workspace.getConfiguration("copycat").undoCommand;

            vscode.commands.executeCommand(undoCommand);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.paste", function () {
            vscode.env.clipboard.readText().then(function (systemClipboard) {
                var pasteCommand = vscode.workspace.getConfiguration("copycat").pasteCommand;
                var copyCommand = vscode.workspace.getConfiguration("copycat").copyCommand;

                if (clipboard === systemClipboard) {
                    vscode.commands.executeCommand(pasteCommand);
                } else {
                    // debug("Using external clipboard content");
                    // vscode.commands.executeCommand(pasteCommand);
                    vscode.window.showInformationMessage(`Fk off copycat! ${systemClipboard}`);

                    const panel = vscode.window.createWebviewPanel("catCoding", "Cat Coding", vscode.ViewColumn.One, {});
                    panel.webview.html = getWebviewContent();
                }
            });
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
