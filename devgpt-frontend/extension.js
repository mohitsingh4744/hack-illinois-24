// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const { automateSearch } = require('../google_search/index.js').default; // Import your backend function

async function fetchDataAndDisplay() {
    try {
        // Fetch data from the backend
        const data = await automateSearch('desigamoorthy nainar');

        // Display the data in a pop-up window
        //vscode.window.showInformationMessage('Data from backend: ' + JSON.stringify(data));
    } catch (error) {
        // If there's an error, display it in a pop-up window
        vscode.window.showErrorMessage('Error fetching data from backend: ' + error.message);
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "devgpt-frontend" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('devgpt-frontend.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		//vscode.window.showInformationMessage('Bozoanan and Lesi from DevGPT!');
		fetchDataAndDisplay();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}