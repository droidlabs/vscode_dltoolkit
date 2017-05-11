const vscode        = require('vscode');

const Locate        = require('../utils/locate_utils');

module.exports = class ShowAllBeansHandler {
  constructor(quickPicker) {
    this.quickPicker = quickPicker;

    return this.handler.bind(this);
  }

  handler() {
    const groupedByPackage      = Locate.findGroupedByPackage('', ['bean']);
    const groupedForQuickPicker = Locate.findForQuickPick('', ['bean']);

    return this.quickPicker(groupedForQuickPicker, "Enter bean name:")
      .then(selectedBean => {
        if (!selectedBean) return;
      
        let packageNumber = +selectedBean.match(/(\d+)\./g)[0] - 1;
        let beanNumber    = +selectedBean.match(/(\d+)\./g)[1] - 1;

        let dependentFile = isNaN(beanNumber) ? groupedByPackage[packageNumber].package.pathToModuleFile() :
                                                groupedByPackage[packageNumber].beans[beanNumber].url;
        
        return vscode.workspace.openTextDocument(dependentFile).then(
          (doc) => {
            return vscode.window.showTextDocument(doc);
          },
          (err) => { 
            return vscode.window.showErrorMessage(err);
          }
        );
      });
  }
}