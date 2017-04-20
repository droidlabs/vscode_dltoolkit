const vscode            = require('vscode');

const Locate            = require('./locate/locate');
const CheckEmptyInject  = require('./check_empty_inject/main');
const PackageParser     = require('./package_parser/main');

const fs                = require('fs');
const path              = require('path');
const mkdirp            = require('mkdirp');

function activate(context) {
    if (!vscode.workspace.rootPath) return;

    const settings = vscode.workspace.getConfiguration("ruby.locate") || {};
    let locate = new Locate(vscode.workspace.rootPath, settings);
    const beanProvider = {
        provideDefinition: (doc, pos) => {
            let bean = doc.getText(doc.getWordRangeAtPosition(pos));
            bean = getBeanRefirement(doc, bean);
            const matches = locate.find(bean);
            return matches.map(m => new vscode.Location(vscode.Uri.file(m.file), new vscode.Position(m.line, m.char)));
        }
    };
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['ruby'], beanProvider));

    let goToPackageCommand = vscode.commands.registerCommand('extension.goToPackage', () => {
        let packageFileContent  = fs.readFileSync(path.join(vscode.workspace.rootPath, 'Rdm.packages')).toString();
        let packageList         = PackageParser(packageFileContent);
        
        (function showPackageDialog() {
            vscode.window.showQuickPick(packageList, {
                placeHolder: "Enter package name"
            }).then((selection) => {
                if (!selection) return;

                let packageDirectory    = path.join(vscode.workspace.rootPath, selection);
                let packageFilesList    = getFilesListForDirectory(packageDirectory).map((item) => {
                    return item.replace(packageDirectory, '');
                }).filter((file) => {
                    let hiddenFilesRegExp = new RegExp("^\.\\w+$", 'i');
                    return !hiddenFilesRegExp.test(path.basename(file));
                });
            
            
                vscode.window.showQuickPick(packageFilesList, {
                    placeHolder: "Enter file name:"
                }).then((pickedFile) => {
                    if (pickedFile) {
                        let fullPickedFile = path.join(packageDirectory, pickedFile);
                        vscode.workspace.openTextDocument(fullPickedFile).then((textDocument) => {
                            vscode.window.showTextDocument(textDocument);
                        });
                    } else {
                        showPackageDialog();
                    }
                });
            });
        })();
    });
    context.subscriptions.push(goToPackageCommand);

    let onSave = vscode.workspace.onDidSaveTextDocument((document) => {
        let checkBeansData = CheckEmptyInject(document.getText());
        
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
    });
    context.subscriptions.push(onSave);

    let checkEmptyInjectCommand = vscode.commands.registerCommand('extension.checkEmptyInject', () => {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showErrorMessage('No opened files to find empty beans');
            return; 
        }

        let checkBeansData = CheckEmptyInject(vscode.window.activeTextEditor.document.getText());
        
        vscode.window.showQuickPick(['Yes', 'No'], { 
            placeHolder: 'Do you want to delete duplicate dependency declarations and unused dependencies?'
        }).then((selection) => { 
            if (selection == 'Yes') {
                let edits   = [];
                let edit    = new vscode.WorkspaceEdit();
                
                checkBeansData.stringsToDelete.forEach((stringToDelete) => {
                    edits.push(
                        vscode.TextEdit.delete({
                            start:  { line: +stringToDelete, character: 0 },
                            end:    { line: +stringToDelete+1, character: 0 }
                        })
                    );
                });
                edit.set(vscode.window.activeTextEditor.document.uri, edits);
                vscode.workspace.applyEdit(edit);
            }
         })
    });
    context.subscriptions.push(checkEmptyInjectCommand);
    
    /// New Feature for specs
    let showSpecCommand = vscode.commands.registerCommand('extension.showSpec', () => {
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

            let filesList           = getFilesListForDirectory(packageFolder);
            let existingClassFile   = filesList.filter((item) => { return path.basename(item) == classFile; })[0] || 
                                      filesList.filter((item) => { return path.basename(item) == alternateClassFile; })[0];

            if (existingClassFile) {
                vscode.workspace.openTextDocument(existingClassFile).then((textDocument) => {
                  vscode.window.showTextDocument(textDocument);
                });
            } else {
                vscode.window.showErrorMessage('Error. No file with tested class!'); 
            }

            return;
        } else if (~currentFileName.indexOf('package/')) {
            let packageFolder   = currentFileName.split('/package/')[0]
            let fullSpecFile    = currentFileName.replace(/package\/\w+\//i, 'spec/').replace('.rb', '_spec.rb');
            let packageSpecFile = currentFileName.split('/package/')[1]
            let specFile        = path.basename(fullSpecFile);
            let specFolder      = specFile.replace('_spec.rb', '');

            let className       = getClassName(DOCUMENT) || classify(packageSpecFile)

            let filesList         = getFilesListForDirectory(path.join(packageFolder, '/spec'));
            let existingSpecFile  = filesList.filter((item) => { return fullSpecFile == item; });
            
            if (!existingSpecFile.length) {
                existingSpecFile = filesList.filter((item) => { 
                    return item.split('/').slice(-2, -1) == specFolder; 
                });
            }      

            if (existingSpecFile.length == 1) {
                vscode.workspace.openTextDocument(existingSpecFile[0]).then((textDocument) => {
                    vscode.window.showTextDocument(textDocument);
                });
            } else if (existingSpecFile.length > 1) {
                let specNames = existingSpecFile.map((item) => item.replace(packageFolder, ''));
                vscode.window.showQuickPick(specNames, { 
                    placeHolder: 'Pick rspec file to show:'
                }).then((selection) => {
                    if (!selection) return;
                    let pickedFile = path.join(packageFolder, selection);

                    vscode.workspace.openTextDocument(pickedFile).then((textDocument) => {
                        vscode.window.showTextDocument(textDocument);
                    });
                });
            } else if (existingSpecFile.length == 0) {
                let specDirname     = path.dirname(fullSpecFile);
                vscode.window.showQuickPick(['Yes', 'No'], { 
                    placeHolder: 'Rspec file for this class does not exist. Create one?'
                }).then((selection) => { 
                    if (selection == 'Yes') {
                        mkdirp.sync(specDirname);
                
                        fs.appendFile(fullSpecFile,
`require 'spec_helper'

describe ${className} do
    before :all do
    end

    it {
    }
end`)
                        vscode.workspace.openTextDocument(fullSpecFile).then((textDocument) => {
                        vscode.window.showTextDocument(textDocument);
                        });
                    } else {
                        return;
                    }
                });
                
            }

            return;
        } else {
            vscode.window.showWarningMessage('File does not belong to any RDM Package!'); 
            return;
        }
    });
    context.subscriptions.push(showSpecCommand);
    
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function getFilesListForDirectory(dir) {
    var results = []

    var list = fs.readdirSync(dir)

    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(getFilesListForDirectory(file))
        else results.push(file)
    })

    return results;
}

function getClassName(document) {
    let defineClassRegex = /class ([a-zA-Z:]+)/i

    for (let i=0;i<document.lineCount;i++) {
        let line = document.lineAt(i).text;

        if (defineClassRegex.test(line)) {
            return line.match(defineClassRegex)[1]
        }
    }

}

function classify(snake_case) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    let result = snake_case.replace(/.rb$/, '');

    result = result.replace(/[\-_^\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });

    result = result.replace(/[\/\s]+(.)?/g, function(match, chr) {
        return '::' + (chr ? chr.toUpperCase() : '');
    });

    return capitalizeFirstLetter(result)
}

function getBeanRefirement(document, beanName) {
    let injectDefinitionRegex = new RegExp("inject\\s+:"+ beanName +",\\s+ref:\\s+:(\\w+)", "i");
    
    for (let i=0;i<document.lineCount;i++) {
        let line = document.lineAt(i).text;
        if (injectDefinitionRegex.test(line)) {
            return line.match(injectDefinitionRegex)[1]
        }
    }

    return beanName;
}

