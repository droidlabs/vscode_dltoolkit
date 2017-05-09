const vscode        = require('vscode');
const Locate        = require('../locate/locate');
const LocateService = new Locate(
  vscode.workspace.rootPath, 
  vscode.workspace.getConfiguration("ruby.locate") || {}
);
const PackageUtils  = require('../utils/package_utils');

module.exports = class FindBeanUsageCommand {
  constructor() {
    return this.handler.bind(this);
  }

  handler() {
    let beanName = this.findBeanName(vscode.window.activeTextEditor.document.getText().split("\n"));
    if (!beanName) return;

    let beansGroupedByPackage = LocateService.find(beanName, ['inject']).reduce((groupedByPackage, bean) => {
      let data = groupedByPackage.find(item => item.name == bean.package);
      if (data) {
        data.beans.push({
          name:          bean.containerBean,
          url:           bean.file
        });

        return groupedByPackage;
      }

      groupedByPackage.push({ 
        name:           bean.package, 
        formattedName:  this.formatPackageToQuickPick(bean.package),
        url:            PackageUtils.getRdmPackageForFile(bean.file).pathToModuleFile(),
        beans: [
          {
            name: bean.containerBean,
            url:  bean.file
          }
        ] 
      });
      
      return groupedByPackage;
    }, []);

    let quickPickData = [];
    beansGroupedByPackage.forEach((pkg, index) => {
      quickPickData.push(`${++index}. Package: ${pkg.formattedName}`);
      pkg.beans.forEach((bean, beanIndex) => {
        quickPickData.push(`    ${index}.${++beanIndex}. ${bean.name}`);
      });
    });

    vscode.window.showQuickPick(
      quickPickData,
      { placeHolder: "Enter inject name:" }
    ).then(selectedBean => {
      if (!selectedBean) return;
      
      let packageNumber = +selectedBean.match(/(\d+)\./g)[0] - 1;
      let beanNumber    = +selectedBean.match(/(\d+)\./g)[1] - 1;

      let dependentFile = isNaN(beanNumber) ? beansGroupedByPackage[packageNumber].url :
                                              beansGroupedByPackage[packageNumber].beans[beanNumber].url;
      
      vscode.workspace.openTextDocument(dependentFile).then((textDocument) => {
        vscode.window.showTextDocument(textDocument);
      },
      (err) => {vscode.window.showErrorMessage(err)});
    });
  }
  findBeanName(fileContent) {
    const beanDefinitionRegexp = new RegExp("\\s*bean\\s+:(\\w+)", "i");
    let beanDefinitionString = fileContent.find((item) => {return beanDefinitionRegexp.test(item)});

    return beanDefinitionString ? beanDefinitionString.match(beanDefinitionRegexp)[1] : false;
  }
  formatPackageToQuickPick(pkgName) {
    return pkgName.split('/')
                  .slice(-1)
                  .pop()
                  .split('_')
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1) )
                  .join(' ')
  }
}