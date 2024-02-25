const vscode = require('vscode');

function sendCodeToBackend(code) {
  console.log('Sending code to backend:', code);

  const backendEndpoint = 'https://example.com'; // Replace with your actual backend URL
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  };

  console.log('HTTP Request:', backendEndpoint, requestOptions);

  fetch(backendEndpoint, requestOptions)
    .then(response => response.json())
    .then(data => {
      console.log('Backend response:', data);
    })
    .catch(error => {
      console.error('Error sending code to backend:', error);
    });
}

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.gptDebug', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selectedText = editor.document.getText(editor.selection);
      console.log("gptDebug: \n");
      sendCodeToBackend(selectedText);
    } else {
      vscode.window.showErrorMessage('No active text editor');
    }
  });

  // Register the command
  context.subscriptions.push(disposable);
  let disposable2 = vscode.commands.registerCommand('extension.gptExplain', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selectedText = editor.document.getText(editor.selection);
      console.log("gptExplain: \n");
      sendCodeToBackend(selectedText);
    } else {
      vscode.window.showErrorMessage('No active text editor');
    }
  });

  // Register the command
  context.subscriptions.push(disposable2);

  let disposable3 = vscode.commands.registerCommand('extension.gptGoogle', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selectedText = editor.document.getText(editor.selection);
      console.log("gptGoogle: \n");
      sendCodeToBackend(selectedText);
    } else {
      vscode.window.showErrorMessage('No active text editor');
    }
  });

  // Register the command
  context.subscriptions.push(disposable3);

  
}

function deactivate() {
  console.log('Extension deactivated');
}

module.exports = {
  activate,
  deactivate
};
