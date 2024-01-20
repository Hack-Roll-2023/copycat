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
					// vscode.commands.executeCommand('workbench.view.explorer');

					// focus on the cat panel
					vscode.commands.executeCommand("copycat.colorsView.focus");
					const panel = vscode.window.createWebviewPanel("catCoding", "Cat Coding", vscode.ViewColumn.One, {});
					panel.webview.html = getWebviewContent();
				}
			});
		})
	);

	const provider = new ColorsViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('copycat.addColor', () => {
			provider.addColor();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('copycat.clearColors', () => {
			provider.clearColors();
		}));
}

// This method is called when your extension is deactivated
export function deactivate() { }

class ColorsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'copycat.colorsView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>

				<button class="add-color-button">Add Color</button>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}