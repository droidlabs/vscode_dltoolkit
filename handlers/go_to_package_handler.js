const vscode        = require('vscode');
const path          = require('path');

const PackageUtils  = require('../utils/package_utils');
const FileUtils     = require('../utils/file_utils');

module.exports = class GoToPackageHandler {
  constructor(packageQuickPicker, fileQuickPicker) {
    this.packageQuickPicker = packageQuickPicker;
    this.fileQuickPicker    = fileQuickPicker;

    return this.handler.bind(this);
  }

  handler() {
    const packageList = PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).map(pkg => pkg.humanName())
    return this.packageQuickPicker(packageList, "Enter package name:").then(selectedPackage => {
      if (!selectedPackage) return;
      
      const packageDirectory = PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).find(item => item.humanName() == selectedPackage).pathToPackage;
      const filesList        = FileUtils.getFilesListForDirectory(packageDirectory).map(item => path.relative(packageDirectory, item))
      return this.fileQuickPicker(filesList, "Enter file name:").then(selectedFile => {
        if (!selectedFile) return this.handler();

          const fullPickedFile = path.join(packageDirectory, selectedFile);
          return vscode.workspace.openTextDocument(fullPickedFile).then((textDocument) => {
            return vscode.window.showTextDocument(textDocument);
          });
      });
    });
  }
}
