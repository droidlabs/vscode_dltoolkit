const vscode            = require('vscode');
const VscodeUtils       = require('./utils/vscode_utils');

const provideDefinition = require('./handlers/bean_provider_definition');

const ShowAllBeansCommand  = require('./handlers/show_all_beans_handler');
const FindBeanUsageHandler = require('./handlers/find_bean_usage_handler');

const GoToPackageCommand     = require('./handlers/go_to_package_handler');
const GeneratePackageCommand = require('./handlers/generatePackageCommand');
const GenerateBeanCommand    = require('./handlers/generateBeanCommand');

const StatusBarHandler    = require('./handlers/status_bar_handler');
const InjectedDepsHandler = require('./handlers/injected_deps_handler');
const GoToSpecHandler     = require('./handlers/go_to_spec_handler');

function activate(context) {
    if (!vscode.workspace.rootPath) return;

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(['ruby'], { provideDefinition: provideDefinition }),

        vscode.commands.registerCommand('extension.findBeanUsage',              new FindBeanUsageHandler(VscodeUtils.showQuickPick)),  
        vscode.commands.registerCommand('extension.showAllBeans',               new ShowAllBeansCommand(VscodeUtils.showQuickPick)),   
        vscode.commands.registerCommand('extension.goToPackage',                new GoToPackageCommand(VscodeUtils.showQuickPick, VscodeUtils.showQuickPick)),    
        vscode.commands.registerCommand('extension.generateNewPackage',         new GeneratePackageCommand()),
        vscode.commands.registerCommand('extension.generateNewBean',            new GenerateBeanCommand()),
        vscode.commands.registerCommand('extension.removeUnusedInjectedDeps',   InjectedDepsHandler.commandHandler),
        vscode.commands.registerCommand('extension.showSpec',                   GoToSpecHandler),

        vscode.window.onDidChangeActiveTextEditor(StatusBarHandler.setPackageNameInStatusBar),
        vscode.workspace.onDidOpenTextDocument(StatusBarHandler.setPackageNameInStatusBar),

        vscode.workspace.onDidSaveTextDocument(InjectedDepsHandler.onSaveHandler)
    );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;





