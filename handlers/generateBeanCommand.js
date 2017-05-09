const vscode        = require('vscode');
const path          = require('path');
const fs            = require('fs');
const PackageUtils  = require('../utils/package_utils');
const FileUtils     = require('../utils/file_utils');
const StringUtils   = require('../utils/string_utils');

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
        let currentPackage = PackageUtils.getRdmPackageForFile(vscode.window.activeTextEditor.document.uri);
        this.pickBeanFolder(currentPackage);
        return;
      }

      vscode.window.showQuickPick(
        PackageUtils.getRdmPackagesList(vscode.workspace.rootPath)
      ).then(otherPkg => {
        if (!otherPkg) return;
        this.pickBeanFolder(otherPkg);
        return;
      });
    });
  }
  pickBeanFolder(pkg) {
    let self = this;
    let packageDirectory   = path.join(pkg.location(), 'package');
    let packageFoldersList = FileUtils.getFoldersForDirectory(packageDirectory).map(item => {
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
      let packageName      = PackageUtils.getRdmPackageForFile(fullBeanFileName);
      let forldersForClass = path.relative(path.join(vscode.workspace.rootPath, packageName, 'package'), fullBeanFileName).replace('.rb', '');
      let className        = StringUtils.classify(forldersForClass, beanName);

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