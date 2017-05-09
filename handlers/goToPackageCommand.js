const vscode        = require('vscode');
const path          = require('path');
const fs            = require('fs');
const PackageUtils = require('../utils/package_utils');

module.exports = class GoToPackageCommand {
  constructor() {
    return this.handler.bind(this);
  }

  handler() {
    const self = this;
    (function showPackageDialog() {
      vscode.window.showQuickPick(PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).map(pkg => pkg.name), {
        placeHolder: "Enter package name:"
      }).then(selectedPackage => {
        if (!selectedPackage) return;
        
        const packageDirectory = path.join(vscode.workspace.rootPath, selectedPackage);

        vscode.window.showQuickPick(
          self.getFilesListForDirectory(packageDirectory).map(item => self.formatFileForQuickPick(packageDirectory, item)),
          { placeHolder: "Enter file name:" } 
        ).then(selectedFile => {
          if (!selectedFile) return showPackageDialog();

            let fullPickedFile = path.join(packageDirectory, selectedFile);
            vscode.workspace.openTextDocument(fullPickedFile).then((textDocument) => {
              vscode.window.showTextDocument(textDocument);
            });
        });
      });
    })()
  }

  formatFileForQuickPick(root, absPath) {
    return path.relative(root, absPath);
  }
  getFilesListForDirectory(root) {
    const self = this;
    const excludedFileRegexes = [
      new RegExp("^\\..*$", "i")
    ]
    var results = []

    fs.readdirSync(root).forEach(function(file) {
      if (excludedFileRegexes.find(regex => regex.test(file))) return;

      file = path.join(root, file);
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) results = results.concat(self.getFilesListForDirectory(file))
      else results.push(file)
    })

    return results;
  }
}
