// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

let clipboard: any;
let previousClipboard: any;

let copyCount = 0;

let lineCount = 1;
let copyCredit = 1;
let prevCopyCredit = copyCredit;

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
        vscode.commands.registerCommand("copycat.paste", () => {
            vscode.env.clipboard.readText().then(function (systemClipboard) {
                var pasteCommand = vscode.workspace.getConfiguration("copycat").pasteCommand;
                // var copyCommand = vscode.workspace.getConfiguration("copycat").copyCommand;

                if (clipboard === systemClipboard) {
                    vscode.commands.executeCommand(pasteCommand);
                } else {
                    console.log("copyCredit", copyCredit);
                    if (copyCredit > 0) {
                        console.log("here 1");
                        // vscode.commands.executeCommand(pasteCommand).then(() => {
                        //     copyCredit -= 1;
                        //     lineCount = 0;
                        //     provider.updateCopyCredit(copyCredit);
                        // });
                        vscode.commands.executeCommand(pasteCommand);
                        copyCredit -= 1;
                        lineCount = 0;
                        provider.updateCopyCredit(copyCredit);
                    } else {
                        console.log("here 2");
                        vscode.commands.executeCommand("copycat.colorsView.focus");
                        vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
                        copyCount += 1;

                        provider.addCopyCounter(copyCount);
                        vscode.window.showInformationMessage(`Fk off copycat! ${systemClipboard}`);
                    }
                }
            });
            return null;
        })
    );

    const provider = new ColorsViewProvider(context.extensionUri);

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.addColor", () => {
            provider.addColor();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.clearColors", () => {
            provider.clearColors();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("copycat.addCopyCounter", (count: number) => {
            provider.addCopyCounter(count);
        })
    );

    // context.subscriptions.push(
    //     vscode.commands.registerCommand("extension.trackKeyDown", () => {
    //         keydownCount++;
    //         copyCredit = Math.ceil(keydownCount / 10);

    //         if (copyCredit !== prevCopyCredit) {
    //             prevCopyCredit = copyCredit;
    //             vscode.window.showInformationMessage(`Your Copy Credit: ${copyCredit}`);
    //         }
    //     })
    // );

    vscode.workspace.onDidChangeTextDocument((event) => {
        // You can add more sophisticated logic to filter specific keydown events
        // For simplicity, we're counting any change in a text document as a keydown
        // if (event.contentChanges.length > 0) {
        //     vscode.commands.executeCommand("extension.trackKeyDown");
        //     console.log("keydown", event.contentChanges.length, keydownCount);
        // }

        const addedLines = event.contentChanges.reduce((count, change) => {
            const line = change.text.split("\n");

            const linesAdded = line[line.length - 1].trim() === "" ? 0 : line.length;

            return count + linesAdded;
        }, 0);

        lineCount += addedLines;

        // copyCredit = Math.ceil(lineCount / 10);
        if (lineCount % 10 === 0) {
            copyCredit += Math.ceil(lineCount / 10);

            // prevCopyCredit = copyCredit;
            lineCount = 0;
            provider.updateCopyCredit(copyCredit);
            vscode.window.showInformationMessage(`Your Copy Credit: ${copyCredit}`);
        }
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}

class ColorsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "copycat.colorsView";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    private getWebviewContent(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));

        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"));

        const catScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "cat1", "main.js"));
        const catImgUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "cat1", "media", "black_1.png"));
        // Do the same for the stylesheet.

        // Use a nonce to only allow a specific script to be run.
        const nonce1 = getNonce();
        const nonce2 = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">

            <title>Cat Coding</title>
        </head>
		
        <body>
            <h1 class="copyCounter">You copied 0 time</h1>
            <h2 class="copyCredit">Your copy credit: 1</h2>
            
            
			<div id="buttons">
				<button onclick="triggerSepcialAction('unhappy')">是狗东西</button>
                <!--
				<button onclick="playAnimation('look_around')">Look Around</button>
                <button onclick="playAnimation('lay_down')">Lay Down</button>
				<button onclick="playAnimation('walk_left')">Walk Left</button>
				<button onclick="playAnimation('walk_right')">Walk Right</button>
				<button onclick="playAnimation('walk_up')">Walk Up</button>
				<button onclick="playAnimation('walk_down')">Walk Down</button>
                -->
			</div>
            

			<canvas id="anim_canvas"/>

			<script nonce="${nonce1}" src="${scriptUri}"></script>
			<script nonce="${nonce2}">
    			window.imgUri = "${catImgUri}";
			</script>
			<script nonce="${nonce2}" src="${catScriptUri}"></script>
        </body>
			
        </html>`;
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this.getWebviewContent(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case "colorSelected": {
                    vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                    break;
                }
            }
        });
    }

    public addColor() {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: "addColor" });
        }
    }

    public clearColors() {
        if (this._view) {
            this._view.webview.postMessage({ type: "clearColors" });
        }
    }

    public addCopyCounter(count: number) {
        if (this._view) {
            this._view.webview.postMessage({ type: "addCopyCount", value: count });
        }
    }

    public updateCopyCredit(credit: number) {
        if (this._view) {
            this._view.webview.postMessage({ type: "updateCopyCredit", value: credit });
        }
    }
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
