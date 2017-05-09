const vscode            = require('vscode');

const provideDefinition         = require('./handlers/bean_provider_definition');
const FindBeanUsageCommand      = require('./handlers/findBeanUsageCommand');
const GoToPackageCommand        = require('./handlers/goToPackageCommand');
const ShowAllBeansCommand       = require('./handlers/showAllBeansCommand');
const GeneratePackageCommand    = require('./handlers/generatePackageCommand');
const GenerateBeanCommand       = require('./handlers/generateBeanCommand');

const StatusBarHandler = require('./handlers/status_bar_handler');
const BeanCheckHandler = require('./handlers/bean_check_handler');
const GoToSpecHandler  = require('./handlers/go_to_spec_handler');

function activate(context) {
    if (!vscode.workspace.rootPath) return;

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(['ruby'], { provideDefinition: provideDefinition }),

        vscode.commands.registerCommand('extension.findBeanUsage',      new FindBeanUsageCommand()),  
        vscode.commands.registerCommand('extension.goToPackage',        new GoToPackageCommand()),    
        vscode.commands.registerCommand('extension.showAllBeans',       new ShowAllBeansCommand()),   
        vscode.commands.registerCommand('extension.generateNewPackage', new GeneratePackageCommand()),
        vscode.commands.registerCommand('extension.generateNewBean',    new GenerateBeanCommand()),
        vscode.commands.registerCommand('extension.checkEmptyInject',   BeanCheckHandler.commandHandler),
        vscode.commands.registerCommand('extension.showSpec',           GoToSpecHandler),

        vscode.window.onDidChangeActiveTextEditor(StatusBarHandler.setPackageNameInStatusBar),
        vscode.workspace.onDidOpenTextDocument(StatusBarHandler.setPackageNameInStatusBar),

        vscode.workspace.onDidSaveTextDocument(BeanCheckHandler.onSaveHandler)
    );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;





