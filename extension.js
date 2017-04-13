const vscode = require('vscode');
const Locate = require('./locate/locate');

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
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;