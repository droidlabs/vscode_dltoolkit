const vscode        = require('vscode');

const BeanUtils     = require('../utils/bean_utils');

function commandHandler() {
  const Editor = vscode.window.activeTextEditor;

  if (!Editor) {
    vscode.window.showErrorMessage('No opened files to find empty beans');
    return; 
  }

  const BeansData = BeanUtils.checkInjects(Editor.document.getText());

  if (process.env.NODE_ENV == "test") {
    return applyDeletions(BeansData.stringsToDelete, Editor.document.uri);
  } else {
    vscode.window.showQuickPick(['Yes', 'No'], { 
      placeHolder: 'Do you want to delete duplicate dependency declarations and unused dependencies?'
    }).then((selection) => { 
      if (selection == 'Yes') {
        applyDeletions(BeansData.stringsToDelete, Editor.document.uri);
      }
    });
  }
}

function onSaveHandler(document) {
    if (~document.uri.path.indexOf('_spec.rb')) return;
    if (!~document.uri.path.indexOf('.rb')) return;

    let checkBeansData = BeanUtils.checkInjects(document.getText());
    
    if (checkBeansData.duplicatedBeans.length > 0) {
        vscode.window.showWarningMessage(
            "Duplicate dependency declarations found: " + checkBeansData.duplicatedBeans.join(", ")
        );
    }

    if (checkBeansData.unusedBeans.length > 0) {
        vscode.window.showWarningMessage(
            "Unused dependency declarations found: " + checkBeansData.unusedBeans.join(", ")
        );
    }
}

function applyDeletions(stringsToDelete, uri) {
  let edits = [];

  stringsToDelete.forEach((string_number) => {
    edits.push(
      vscode.TextEdit.delete({
        start:  { line: +string_number, character: 0 },
        end:    { line: +string_number+1, character: 0 }
      })
    );
  });

  let edit = new vscode.WorkspaceEdit();
  edit.set(uri, edits);

  return vscode.workspace.applyEdit(edit);
}

module.exports = {
  commandHandler: commandHandler,
  onSaveHandler:  onSaveHandler
}