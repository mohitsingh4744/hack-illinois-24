const vscode = require('vscode');

const puppeteer = require('puppeteer');

async function automateSearch(searchText) {
  const browser = await puppeteer.launch({ headless: false });
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1288, height: 800 });
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`);
  console.log("Popup page is open. Close it manually to end.");
}

async function fetchDataAndDisplay(code, option, subOption, userInput) {
  try {
    if (!code.trim()) {
      throw new Error('Selected text is empty. Please highlight some code before using this command.');
    }

    // Fetch data based on selected option, sub-option, highlighted code, and user input
    let data;
    if (option === 'DevSearch' && subOption === 'debug') {
      data = await automateSearch(`Debug ${code}`);
    } else if (option === 'DevSearch' && subOption === 'explain') {
      data = await automateSearch(`Explain ${code}`);
    } else if (option === 'DevSearch' && subOption === 'custom') {
      // Handle custom logic for DevSearch custom option with user input
      data = await automateSearch(`${userInput} ${code}`);
    } else if (option === 'DevGPT' && subOption === 'debug') {
      // Handle logic for DevGPT debug
    } else if (option === 'DevGPT' && subOption === 'explain') {
      // Handle logic for DevGPT explain
    } else if (option === 'DevGPT' && subOption === 'custom') {
      // Handle custom logic for DevGPT custom option with user input
      data = await fetchDataForCustomOption(code, userInput);
    }

    // Display the data in a pop-up window
    vscode.window.showInformationMessage('Data from backend: ' + JSON.stringify(data));
  } catch (error) {
    // If there's an error, display it in a pop-up window
    vscode.window.showErrorMessage('Error fetching data from backend: ' + error.message);
  }
}

// Function to handle custom logic for DevSearch and DevGPT custom options with user input
async function fetchDataForCustomOption(code, userInput) {
  // Implement your custom logic using code, userInput, etc.
  // Return the data fetched based on the custom logic
  return await automateSearch(`Custom ${code} with input: ${userInput}`);
}

function activate(context) {
  // Command to trigger the main popup with options
  let mainCommandDisposable = vscode.commands.registerCommand('extension.showOptions', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selectedText = editor.document.getText(editor.selection).trim();
      if (!selectedText) {
        vscode.window.showErrorMessage('Selected text is empty. Please highlight some code before using this command.');
        return;
      }

      const option = await vscode.window.showQuickPick([
        { label: 'DevSearch', iconPath: new vscode.ThemeIcon('search-editor-label-icon') },
        { label: 'DevGPT', iconPath: new vscode.ThemeIcon('hubot') },
        // Add more options with corresponding icons
      ], {
        placeHolder: 'Select an option',
        matchOnDescription: true,
      });

      if (option) {
        const subOption = await vscode.window.showQuickPick([
          { label: 'debug', iconPath: new vscode.ThemeIcon('disassembly-editor-label-icon') }, 
          { label: 'explain', iconPath: new vscode.ThemeIcon('notebook-render-output') }, 
          { label: 'custom', iconPath: new vscode.ThemeIcon('notebook-edit') }
        ], {
          placeHolder: 'Select a sub-option',
        });

        if (subOption) {
          let userInput;
          if (subOption.label === 'custom') {
            userInput = await vscode.window.showInputBox({ prompt: 'Enter custom input' });
          }
          fetchDataAndDisplay(selectedText, option.label, subOption.label, userInput);
        }
      }
    } else {
      vscode.window.showErrorMessage('No active text editor');
    }
  });

  context.subscriptions.push(mainCommandDisposable);
}

function deactivate() {
  console.log('Extension deactivated');
}

module.exports = {
  activate,
  deactivate
};
