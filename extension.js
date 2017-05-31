const vscode            = require('vscode');
const VscodeUtils       = require('./utils/vscode_utils');

const provideDefinition = require('./handlers/bean_provider_definition');

const ShowAllBeansCommand  = require('./handlers/show_all_beans_handler');
const FindBeanUsageHandler = require('./handlers/find_bean_usage_handler');

const GoToPackageHandler     = require('./handlers/go_to_package_handler');
const GeneratePackageHandler = require('./handlers/generate_package_handler');
const GenerateBeanHandler    = require('./handlers/generate_bean_handler');

const StatusBarHandler    = require('./handlers/status_bar_handler');
const InjectedDepsHandler = require('./handlers/injected_deps_handler');

const GoToSpecHandler     = require('./handlers/go_to_spec_handler');

function activate(context) {
    if (!vscode.workspace.rootPath) return;

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(['ruby'], { provideDefinition: provideDefinition }),

        vscode.commands.registerCommand('extension.findBeanUsage',              new FindBeanUsageHandler(VscodeUtils.showQuickPick)),  
        vscode.commands.registerCommand('extension.showAllBeans',               new ShowAllBeansCommand(VscodeUtils.showQuickPick)),   
        vscode.commands.registerCommand('extension.goToPackage',                new GoToPackageHandler(VscodeUtils.showQuickPick, VscodeUtils.showQuickPick)),    
        vscode.commands.registerCommand('extension.generateNewPackage',         new GeneratePackageHandler(VscodeUtils.showInputBox, VscodeUtils.showQuickPick, VscodeUtils.showInputBox)),
        vscode.commands.registerCommand('extension.generateNewBean',            new GenerateBeanHandler(VscodeUtils.showQuickPick, VscodeUtils.showQuickPick, VscodeUtils.showQuickPick, VscodeUtils.showInputBox)),
        vscode.commands.registerCommand('extension.removeUnusedInjectedDeps',   InjectedDepsHandler.commandHandler),
        vscode.commands.registerCommand('extension.showSpec',                   GoToSpecHandler),

        vscode.window.onDidChangeActiveTextEditor(StatusBarHandler.setPackageNameInStatusBar),
        vscode.workspace.onDidOpenTextDocument(StatusBarHandler.setPackageNameInStatusBar),

        vscode.window.onDidChangeActiveTextEditor(StatusBarHandler.checkSpecExistance),
        vscode.workspace.onDidOpenTextDocument(StatusBarHandler.checkSpecExistance),

        vscode.workspace.onDidSaveTextDocument(InjectedDepsHandler.onSaveHandler)
    );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;





