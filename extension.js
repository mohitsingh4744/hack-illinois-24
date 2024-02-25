// Import dependencies
const vscode = require('vscode');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
const path = require('path');
const os = require('os');
const fs = require('fs');

const openai = new OpenAI({
	apiKey: "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"
});

let savedData = null;
/**
 * Conducts an OpenAI API call based on user input and returns OpenAI's response to user query
 * @param {string} userInput The user input, concatenated with additional info depending on user choice
*/
async function gptSearch(userInput) {
  try {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [{
    role: "user",
            content: userInput,
        }],
        temperature: 0,
        max_tokens: 200,
        top_p: 1.0,
        frequency_penalty: 0.0,
    }); 
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "Error fetching response from OpenAI.";
  }
}

/**
 * Simulates a Google search and opens a pop-up Chrome browser with the search results
 * @param {string} searchText The string that should be entered into google.com as a search query
*/
async function automateSearch(searchText) {
  // Creates a Chrome browser that creates a pop-up window
  const browser = await puppeteer.launch({ headless: false });

  // Finds the current tab and sets width and height to fill the display screen
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1288, height: 800 });

  // Uses searchText parameter to generate a URL to perform the Google search on the Chrome browser
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`);
  console.log("Popup page is open. Close it manually to end.");
}

/**
 * Main function of DevHelper that takes the user input and code and makes calls to automateSearch or gptSearch
 * Outputs results from gptSearch 
 * @param {string} code Contains highlighted code that DevHelper should analyze
 * @param {string} option Indicates DevSearch or DevGPT call
 * @param {string} subOption Indicates subcategory of DevSearch or DevGPT call
 * @param {string} userInput Contains user input (if any)
*/
async function fetchDataAndDisplay(code, option, subOption, userInput) {
  try {
    if (!code.trim()) {
      throw new Error('Selected text is empty. Please highlight some code before using this command.');
    }

    let data;
    let search;
    if (option === 'DevSearch' && subOption === 'debug') {
      search=0;
      await automateSearch(`Debug ${code}`);
    } else if (option === 'DevSearch' && subOption === 'explain') {
      search=0;
      await automateSearch(`Explain ${code}`);
    } else if (option === 'DevSearch' && subOption === 'custom') {
      search=0;
      await automateSearch(`${userInput} ${code}`); 
    } else if (option === 'DevGPT' && subOption === 'debug') {
      search=1;
      data = await gptSearch(`Debug: ${code}`);
    } else if (option === 'DevGPT' && subOption === 'explain') {
      search=1;
      data = await gptSearch(`Explain: ${code}`);
    } else if (option === 'DevGPT' && subOption === 'translate') {
      search=1;
      data = await gptSearch(`Convert the following code into ${userInput}: ${code}`);
    } else if (option === 'DevGPT' && subOption === 'custom') {
      search=1;
      data = await gptSearch(`${userInput} ${code}`);
    } else if (option === 'DevGPT' && subOption === 'replace') {
      search = 2;

      if (savedData == null) {
        vscode.window.showErrorMessage('No previous call to DevGPT');
      } else {
        data = await gptSearch(`${savedData} \n Give me back only the code, no additional responses before and after, and don't format it. just return in plain text`)
      }
    }

    if (search===1) {
      const markdownString = new vscode.MarkdownString();
      markdownString.appendCodeblock(data);
      data = data.replace(/\\n/g, '\n');
      savedData = data;


      const tempFilePath = path.join(os.tmpdir(), 'vscode_extension_output.md');
      fs.writeFileSync(tempFilePath, data);

      vscode.workspace.openTextDocument(tempFilePath).then((doc) => {
        vscode.window.showTextDocument(doc);
      });
    } else if (search === 2) {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document) {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(editor.document.uri, editor.selection, data);
          await vscode.workspace.applyEdit(edit);
      } else {
          vscode.window.showErrorMessage('No active text editor or document');
      }
    }
  }
 
  catch (error) {
    vscode.window.showErrorMessage('Error fetching data from backend: ' + error.message);
  }
}

/**
 * Activates the program and lays out the UI options for the user to interact with
 * @param context 
*/
function activate(context) {
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
      ], {
        placeHolder: 'Select an option',
        matchOnDescription: true,
      });

      if (option.label === 'DevSearch') {
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
      }else if (option.label === 'DevGPT') {
        const subOption = await vscode.window.showQuickPick([
          { label: 'debug', iconPath: new vscode.ThemeIcon('disassembly-editor-label-icon') }, 
          { label: 'explain', iconPath: new vscode.ThemeIcon('notebook-render-output') }, 
          { label: 'translate', iconPath: new vscode.ThemeIcon('link') },
          { label: 'replace', iconPath: new vscode.ThemeIcon('find-replace') },
          { label: 'custom', iconPath: new vscode.ThemeIcon('notebook-edit') }
        ], {
          placeHolder: 'Select a sub-option',
        });

        if (subOption) {
          let userInput;
          if (subOption.label === 'translate') {
            userInput = await vscode.window.showInputBox({ prompt: 'Enter target language' });
          } else if (subOption.label === 'custom') {
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