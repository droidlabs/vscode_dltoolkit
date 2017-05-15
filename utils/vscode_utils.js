const vscode = require('vscode');

module.exports = class VscodeUtils {
  static showQuickPick(optionList, placeHolder) {
    return vscode.window.showQuickPick(optionList, { placeHolder: placeHolder });
  }

  static showQuickPickTest(selectedOption) {
    return function(optionList, placeHolder) {
      return Promise.resolve(selectedOption)
    }
  }

  static showInputBox(placeHolder) {
    return vscode.window.showInputBox({placeHolder: placeHolder})
  }

  static showInputBoxTest(inputValue) {
    return function(placeHolder) {
      return Promise.resolve(inputValue);
    }
  }
}


