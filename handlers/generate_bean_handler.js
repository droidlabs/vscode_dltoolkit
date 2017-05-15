const vscode        = require('vscode');
const path          = require('path');
const mkdirp        = require('mkdirp');
const fs            = require('fs');

const PackageUtils  = require('../utils/package_utils');
const FileUtils     = require('../utils/file_utils');
const StringUtils   = require('../utils/string_utils');


module.exports = class GenerateBeanHandler {
  static Rubyfy(name = "") {
    const RubyExtension = '.rb';
    
    return name + RubyExtension;
  }

  constructor(currentProjectPicker, packagePicker, folderPicker, beanNamePicker) {
    this.currentProjectPicker = currentProjectPicker
    this.packagePicker        = packagePicker;
    this.folderPicker         = folderPicker;
    this.beanNamePicker       = beanNamePicker;

    return this.handler.bind(this)
  }

  handler() {
    return this.pickCurrentPackage()
      .then(this.pickBeanFolder.bind(this), this.handleError)
      .then(this.pickBeanName.bind(this), this.handleError)
      .then(this.createBeanFile.bind(this), this.handleError);
  }

  pickCurrentPackage() {
    const CurrentPackageOption = 'Current package';
    const OtherPackageOption   = 'Other package';

    return this.currentProjectPicker([CurrentPackageOption, OtherPackageOption], "Create new Bean for:").then(result => {
      switch (result) {
        case CurrentPackageOption:
          return Promise.resolve(
            PackageUtils.getRdmPackageForFile(vscode.window.activeTextEditor.document.uri.path)
          );

        case OtherPackageOption:
          return this.pickBeanPackage();

        default:
          throw new Error('Package was not selected. Bean Creation Process was aborted!');
      }
    });
  }

  pickBeanPackage() {    
    const PackageCollection = PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).map(item => item.humanName());
    
    return this.packagePicker(PackageCollection, "Enter Package Name:").then(result => {
      if (!result) throw new Error('Bean creation process was cancelled');
      
      const PickedPackage = PackageUtils.getRdmPackagesList(vscode.workspace.rootPath).find(item => item.humanName() == result);

      if (!PickedPackage) throw new Error('Package does not exist');
      return Promise.resolve(PickedPackage);
    });
  }
  
  pickBeanFolder(pkg) {
    const packageDirectory   = path.join(pkg.pathToPackage, 'package');
    const packageFoldersList = FileUtils
      .getFoldersForDirectory(packageDirectory)
      .map(item =>  path.relative(packageDirectory, item) );
    
    return this.folderPicker(packageFoldersList, 'Choose folder to create Bean').then(folder => {
      if (!folder) { throw new Error('Folder was not selected. Bean Creation Process was aborted!'); }
      
      return path.join(packageDirectory, folder);
    });
  }

  pickBeanName(folder) {
    return this.beanNamePicker('Choose folder to create Bean').then(name => {
      if (!name) { throw new Error('Bean name was not selected. Bean Creation Process was aborted!'); }
      
      return path.join(folder, GenerateBeanHandler.Rubyfy(name))
    });
  }

  createBeanFile(pathToBean) {
    const relPathToBean   = pathToBean.split('/package/')[1];
    const ClassName       = StringUtils.getRubyClassNameFromPath(relPathToBean);
    const BeanName        = path.basename(pathToBean, GenerateBeanHandler.Rubyfy());

    if (!fs.existsSync(pathToBean)) {
      mkdirp.sync(path.dirname(pathToBean));
      fs.appendFileSync(pathToBean, this.beanFileContent(ClassName, BeanName));
    }

    return vscode.workspace.openTextDocument(pathToBean).then((doc) => {
      return vscode.window.showTextDocument(doc);
    });
  }

  beanFileContent(className, beanName) {
    const content = 

`class ${className}
  bean :${beanName}
end`
    
    return content;
  }

  handleError(error) {
    vscode.window.showErrorMessage(error);
    return Promise.reject(error);
  }
}