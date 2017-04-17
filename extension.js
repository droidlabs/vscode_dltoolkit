const vscode    = require('vscode');
const Locate    = require('./locate/locate');
const fs        = require('fs');
const path      = require('path');
const mkdirp    = require('mkdirp');

function activate(context) {
    if (!vscode.workspace.rootPath) return;

    const settings = vscode.workspace.getConfiguration("ruby.locate") || {};
    let locate = new Locate(vscode.workspace.rootPath, settings);
    const beanProvider = {
        provideDefinition: (doc, pos) => {
            const txt = doc.getText(doc.getWordRangeAtPosition(pos));
            const matches = locate.find(txt);
            return matches.map(m => new vscode.Location(vscode.Uri.file(m.file), new vscode.Position(m.line, m.char)));
        }
    };

    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['ruby'], beanProvider));
    
    /// New Feature for specs
    var disposable = vscode.commands.registerCommand('extension.showSpec', () => {
        const DOCUMENT          = vscode.window.activeTextEditor.document
        const currentFileName   = DOCUMENT.fileName

        if (~currentFileName.indexOf('spec/')) { 
            let packageFolder   = currentFileName.split('/spec/')[0]
            let fullClassFile   = currentFileName.replace('spec/', 'package/').replace('_spec.rb', '.rb');
            let classFile       = path.basename(fullClassFile);

            let filesList           = getFilesListForDirectory(packageFolder);
            let existingClassFile   = filesList.filter((item) => {
                return path.basename(item) == classFile;
            })[0];

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
            let fullSpecFile    = currentFileName.replace('package/', 'spec/').replace('.rb', '_spec.rb');
            let packageSpecFile = currentFileName.split('/package/')[1]
            let specFile        = path.basename(fullSpecFile);

            let className       = getClassName(DOCUMENT) || classify(packageSpecFile)

            let filesList           = getFilesListForDirectory(packageFolder);
            let existingSpecFile    = filesList.filter((item) => {
                return path.basename(item) == specFile;
            })[0];

            if (existingSpecFile) {
                vscode.workspace.openTextDocument(existingSpecFile).then((textDocument) => {
                  vscode.window.showTextDocument(textDocument);
                });

            } else {
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
                    }
                });
                
            }

            return;
        } else {
            vscode.window.showWarningMessage('File does not belong to any RDM Package!'); 
            return;
        }
    });
    context.subscriptions.push(disposable);
    
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

