const vscode       = require('vscode');
const path         = require('path');
const PackageUtils = require('../utils/package_utils');

const NewFolderForPackage = "New folder";

module.exports = class GeneratePackageHandler {
  constructor (namePicker, folderPicker, newFolderPicker) { 
    this.namePicker      = namePicker;
    this.folderPicker    = folderPicker;
    this.newFolderPicker = newFolderPicker;

    return this.handle.bind(this);
  }

  handle() {
    return this.namePicker("Type package name:").then(selectedName => {
      if (!selectedName) return;

      return this.folderPicker(this.packageLocationFolders(), "Type package folder:").then(selectedFolder => {
        switch (selectedFolder) {
          case NewFolderForPackage: 
            return this
              .newFolderPicker("Select folder")
              .then(result => this.RdmCreatePackage(selectedName, result));
          case undefined:
            return;
          default:
            return this.RdmCreatePackage(selectedName, selectedFolder);
        }
      })
    })
  }

  // 'core/domain/entities' => 'core/domain'
  // 'projects'             => ''
  packageLocationFolders() {
    let result = PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).map(pkg => {
      let result = path.dirname(path.relative(vscode.workspace.rootPath, pkg.location()))
      return result ? result : "./";
    });

    result.unshift(NewFolderForPackage);

    return result.filter((item, idx, arr) => arr.indexOf(item) == idx);
  }

  RdmCreatePackage(name, folder) {
    let execSync = require('child_process').execSync;
    let fullPath = path.join(vscode.workspace.rootPath, folder, name);
    let relPath  = path.relative(vscode.workspace.rootPath, fullPath);
    let filePath = path.join(`package/${name}.rb`);
    let mainFile = path.join(fullPath, filePath);

    execSync(`cd ${vscode.workspace.rootPath} && mkdir -p ${path.join(vscode.workspace.rootPath, folder)} && bundle exec rdm gen.package ${name} --path=${relPath}`, (err, stdout, stderr) => {
      if (err) return vscode.window.showWarningMessage(stderr); 
    });

    return vscode.workspace.openTextDocument(mainFile).then((textDocument) => {
      return vscode.window.showTextDocument(textDocument);
    });
  }
}