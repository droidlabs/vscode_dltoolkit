const vscode = require('vscode');
const Locate = require('../locate/locate');

module.exports = class findBeanUsageCommand {
  constructor() {
    return this.handler.bind(this);
  }

  handler() {
    let beanName = this.findBeanName(vscode.window.activeTextEditor.document.getText().split("\n"));
    if (!beanName) return;

    let beansGroupedByPackage = Locate.find(beanName, ['inject']).reduce((groupedByPackage, bean) => {
      groupedByPackage[bean.package] = groupedByPackage[bean.package] || [];
      groupedByPackage[bean.package].push({
        "name": bean.containerBean,
        "url":  bean.url
      });
      return groupedByPackage;
    }, {});

    let quickPickData = [];
    for (let pkg in beansGroupedByPackage) {
      quickPickData.push(`Package: ${pkg}`);
      beansGroupedByPackage[pkg].forEach(data => quickPickData.push(`      ${data}`));
    }

    vscode.window.showQuickPick(
      quickPickData,
      { placeHolder: "Enter inject name:" }
    ).then(selectedBean => {
      if (!selectedBean) return;
      if (~selectedBean.indexOf('Package:')) return;

      let dependentFile = Locate.find(selectedBean.trim(), ['bean']);
      debugger;

      vscode.workspace.openTextDocument(dependentFile.file).then((textDocument) => {
        vscode.window.showTextDocument(textDocument);
      });
    });
  }
  findBeanName(fileContent) {
    const beanDefinitionRegexp = new RegExp("\\s*bean\\s+:(\\w+)", "i");
    let beanDefinitionString = fileContent.find((item) => {return beanDefinitionRegexp.test(item)});

    return beanDefinitionString ? beanDefinitionString.match(beanDefinitionRegexp)[1] : false;
  }
}