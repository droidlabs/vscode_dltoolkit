const Locate        = require('../locate/locate');
const PackageParser = require('../package_parser/main');

const vscode        = require('vscode');

module.exports = class ShowAllBeansCommand {
  constructor() {
    return this.handler.bind(this);
  }
  handler() {
    
    let beansGroupedByPackage = Locate.find('', ['bean']).reduce((groupedByPackage, bean) => {
      let data = groupedByPackage.find(item => item.name == bean.package);
      if (data) {
        data.beans.push({
          name:          bean.name,
          url:           bean.file
        });

        return groupedByPackage;
      }
      
      groupedByPackage.push({ 
        name:           bean.package, 
        formattedName:  this.formatPackageToQuickPick(bean.package),
        url:            PackageParser.getPackageModuleUrl(bean.package),
        beans: [
          {
            name: bean.name,
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
      { placeHolder: "Enter bean name:" }
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
  formatPackageToQuickPick(pkgName) {
    return pkgName.split('/')
                  .slice(-1)
                  .pop()
                  .split('_')
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1) )
                  .join(' ')
  }
}