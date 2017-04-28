const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const PackageParser = require('../package_parser/main');
const Utils = require('../utils/utils');

module.exports = class GenerateNewBean {
  constructor() {
    return this.handler.bind(this)
  }

  handler() {
    vscode.window.showQuickPick(
      ['Current package', 'Other package'],
      { placeHolder: "Enter bean name:" }
    ).then(pkg => {
      if (!pkg) return;
      if (pkg == 'Current package') {
        let currentPackage = PackageParser.getCurrentPackage(vscode.window.activeTextEditor.document.uri);
        this.pickBeanFolder(currentPackage);
        return;
      }

      vscode.window.showQuickPick(
        PackageParser.getPackageList()
      ).then(otherPkg => {
        if (!otherPkg) return;
        this.pickBeanFolder(otherPkg);
        return;
      });
    });
  }
  pickBeanFolder(pkg) {
    let self = this;
    let packageDirectory   = path.join(vscode.workspace.rootPath, pkg, 'package');
    let packageFoldersList = Utils.getFoldersForDirectory(packageDirectory).map(item => {
      return path.relative(packageDirectory, item);
    });
    vscode.window.showQuickPick(packageFoldersList, {
      placeHolder: 'Choose folder to create Bean'
    }).then(folder => {
      if (!folder) return;
      self.pickBeanName(path.join(vscode.workspace.rootPath, pkg, 'package', folder));
    });
  }

  pickBeanName(folder) {
    vscode.window.showInputBox({ placeHolder: 'Choose folder to create Bean' }).then(beanName => {
      if (!beanName) return;

      let fullBeanFileName = path.join(folder, beanName + '.rb');
      let packageName      = PackageParser.getCurrentPackage(fullBeanFileName);
      let forldersForClass = path.relative(path.join(vscode.workspace.rootPath, packageName, 'package'), fullBeanFileName).replace('.rb', '');
      let className        = Utils.classify(forldersForClass, beanName);

      if (!fs.existsSync(fullBeanFileName)) {
        fs.appendFile(fullBeanFileName, 
`class ${className}
  bean :${beanName}
end`
        );
      }

      vscode.workspace.openTextDocument(fullBeanFileName).then((textDocument) => {
        vscode.window.showTextDocument(textDocument);
      });
    });
  }
}