const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const mkdirp = require('mkdirp');

const FileUtils   = require('../utils/file_utils');
const StringUtils = require('../utils/string_utils');

module.exports = function goToSpecHandler() {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showErrorMessage('No opened files to find specs');
    return; 
  }

  const DOCUMENT          = vscode.window.activeTextEditor.document
  const currentFileName   = DOCUMENT.fileName

  if (~currentFileName.indexOf('spec/')) { 
    let packageFolder   = currentFileName.split('/spec/')[0]
    let fullClassFile   = currentFileName.replace('spec/', 'package/').replace('_spec.rb', '.rb');
    let classFile       = path.basename(fullClassFile);
    let alternateClassFile = fullClassFile.split('/').slice(-2,-1) + '.rb'

    let filesList           = FileUtils.getFilesListForDirectory(packageFolder);
    let existingClassFile   = filesList.filter((item) => { return path.basename(item) == classFile; })[0] || 
                              filesList.filter((item) => { return path.basename(item) == alternateClassFile; })[0];

    if (existingClassFile) {
      return vscode.workspace.openTextDocument(existingClassFile).then((textDocument) => {
        return vscode.window.showTextDocument(textDocument);
      });
    } else {
      vscode.window.showErrorMessage('No class found for current spec. Was it moved?'); 
    }

    return;
  } else if (~currentFileName.indexOf('package/')) {
    let existingSpecFiles = FileUtils.findSpecFiles(currentFileName);
    
    if      (existingSpecFiles.length == 1) return goFromPackageToSpec(existingSpecFiles[0]);
    else if (existingSpecFiles.length >  1) return goFromPackageToSpecFolder(existingSpecFiles);
    else if (existingSpecFiles.length == 0) return goFromPackageToNewSpecFile(currentFileName);
    else return vscode.window.showWarningMessage('File does not belong to any package'); 
  }
}

function goFromPackageToSpec(SingleSpecFile) {
  return vscode.workspace.openTextDocument(SingleSpecFile).then((doc) => {
    return vscode.window.showTextDocument(doc);
  });
}

function goFromPackageToSpecFolder(MultipleSpecFile) {
  let specNames = MultipleSpecFile.map((item) => path.basename(item));
  
  if (process.env.NODE_ENV == "test") return specNames;

  vscode.window.showQuickPick(specNames, { 
    placeHolder: 'Select spec file:'
  }).then((selection) => {
    if (!selection) return;

    let pickedFile = MultipleSpecFile.find((item) => { return path.basename(item) == selection});

    return vscode.workspace.openTextDocument(pickedFile).then((doc) => {
      return vscode.window.showTextDocument(doc);
    });
  });
}

function goFromPackageToNewSpecFile(currentFile) {      
  let packageSpecFile = currentFile.split('/package/')[1]
  let className       = FileUtils.getClassName(vscode.window.activeTextEditor.document) || StringUtils.classify(packageSpecFile)
  let fullSpecFile    = currentFile.replace('package/', 'spec/').replace('.rb', '_spec.rb');

  if (process.env.NODE_ENV == "test") return createNewSpecFile(fullSpecFile, className);

  vscode.window.showQuickPick(['Yes', 'No'], { 
    placeHolder: 'Spec file was not found. Do you want to create new one?'
  }).then((selection) => { 
    if (selection == 'Yes') {
      return createNewSpecFile(fullSpecFile, className);
    } else {
      return null;
    }
  });
}

function createNewSpecFile(fullSpecFile, className) {
  mkdirp.sync(path.dirname(fullSpecFile));

  fs.appendFileSync(fullSpecFile, contentForSpecFile(className))

  return vscode.workspace.openTextDocument(fullSpecFile).then((textDocument) => {
    return vscode.window.showTextDocument(textDocument);
  });
}

function contentForSpecFile(describedClass) {
  const content = 
`describe ${describedClass} do
  before :all do
  end

  it {
  }
end`

  return content;
}