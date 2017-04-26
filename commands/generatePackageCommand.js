const vscode = require('vscode');
const path   = require('path');
const mkdirp = require('mkdirp');
const PackageParser = require('../package_parser/main');

module.exports = class GeneratePackageCommand {
  static get CREATE_NEW_FOLDER() { return 'Новая папка:' }
  constructor () { return this.handle.bind(this) }

  handle() {
    vscode.window.showInputBox({
      placeHolder: "Enter package name:"
    }).then(selectedName => {
      if (!selectedName) return;
      vscode.window.showQuickPick(this.packageLocationFolders(), {
        placeHolder: "Enter package folder:"
      }).then(selectedFolder => {
        if (!selectedFolder) return;
        if (selectedFolder == GeneratePackageCommand.CREATE_NEW_FOLDER) {
          vscode.window.showInputBox({
            placeHolder: 'Input new package name from project root:'
          }).then(result => this.RdmCreatePackage(selectedName, result));
          return;
        }
        this.RdmCreatePackage(selectedName, selectedFolder);
        return;
      })
    })
  }
  packageLocationFolders() {
    let result = PackageParser.getPackageList()
                              .map(item => item.split("/")
                              .slice(0, -1).join('/'))
                              .filter((item, index, array) => array.indexOf(item) == index);
    result.unshift(GeneratePackageCommand.CREATE_NEW_FOLDER);
    return result;
  }
  RdmCreatePackage(name, folder) {
    let exec = require('child_process').exec;
    let fullPath = path.join(vscode.workspace.rootPath, folder, name);
    let mainFile = path.join(fullPath, `package/${name}.rb`);

    mkdirp.sync(fullPath);

    exec(`cd ${vscode.workspace.rootPath} && rdm gen.package ${name} --path=${fullPath}`, (err, stdout, stderr) => {
      if (err) {
        return;
      }

      vscode.workspace.openTextDocument(mainFile).then((textDocument) => {
        vscode.window.showTextDocument(textDocument);
      });
    });
  }
}