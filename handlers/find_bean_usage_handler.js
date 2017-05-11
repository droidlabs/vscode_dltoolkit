const vscode        = require('vscode');

const Locate        = require('../utils/locate_utils');

module.exports = class FindBeanUsageHandler {
  constructor(quickPicker) {
    this.quickPicker = quickPicker;

    return this.handle.bind(this);
  }

  handle() {
    return Locate
      .listInFile(vscode.window.activeTextEditor.document.uri.path)
      .then(fileData => {
        const beanData = fileData.find(item => item.type == "bean");
        if (!beanData) throw new Error("There is no beans defined at file");

        const groupedByPackage      = Locate.findGroupedByPackage(beanData.name, ['inject']);
        const groupedForQuickPicker = Locate.findForQuickPick(beanData.name, ['inject']);

        return this.quickPicker(groupedForQuickPicker, 'Pick bean to go:').then(selectedBean => {
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
      });
  }
}