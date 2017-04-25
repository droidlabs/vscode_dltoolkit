const Locate        = require('../locate/locate');
const PackageParser = require('../package_parser/main');

const vscode        = require('vscode');

module.exports = class ShowAllBeansCommand {
  constructor() {
    return this.handler.bind(this);
  }
  handler() {
    let allBeansGroupedByPackage = Locate.find('', ['bean']).reduce((groupedByPackage, bean) => {
      groupedByPackage[bean.package] = groupedByPackage[bean.package] || [];
      groupedByPackage[bean.package].push({
        "name": bean.name,
        "file": bean.file
      });
      return groupedByPackage;
    }, {});

    let quickPickData = [];
    for (let pkg in allBeansGroupedByPackage) {
      quickPickData.push(`Package: ${pkg}`);
      allBeansGroupedByPackage[pkg].forEach(data => quickPickData.push(`      ${data.name}`));
    }

    vscode.window.showQuickPick(quickPickData, { 
      placeHolder: 'Do you want to delete duplicate dependency declarations and unused dependencies?'
    }).then(selectedBean => {
      if (!selectedBean) return;
      if (~selectedBean.indexOf('Package:')) return;

      let beanFile = Locate.find(selectedBean.trim(), ['bean'])[0];
      vscode.workspace.openTextDocument(beanFile.file).then((textDocument) => {
        vscode.window.showTextDocument(textDocument);
      });
    })
  }
}