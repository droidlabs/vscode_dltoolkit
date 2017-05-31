const vscode        = require('vscode');

const PackageUtils  = require('../utils/package_utils');
const FileUtils     = require('../utils/file_utils');

const PACKAGE_NAME_PRIORITY   = 100;
const SPEC_EXISTANCE_PRIORITY = 110;
const statusBar               = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, PACKAGE_NAME_PRIORITY);
const specStatusBar           = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, SPEC_EXISTANCE_PRIORITY);

function setPackageNameInStatusBar(document) {
  let packageData = PackageUtils.getRdmPackageForFile(document.fileName);
  
  if (packageData) {
    statusBar.text = `Package: ${packageData.humanName()}`;
    statusBar.show();
  } else {
    statusBar.text = '';
    statusBar.hide();
  }
}

function checkSpecExistance(document) {
  let specFiles = FileUtils.findSpecFiles(document.fileName.replace('.git', ''));
  console.log(specFiles);
  if (specFiles === undefined) {
    specStatusBar.text = '';
    specStatusBar.hide();
    return  
  }

  if (specFiles.length) {
    specStatusBar.text = `${specFiles.length} rspec files was found`;
    specStatusBar.show();
  } else {
    specStatusBar.text = 'No rspec files was found';
    specStatusBar.show();
  }
}

module.exports = {
  packageNameStatusBarItem:  statusBar,
  setPackageNameInStatusBar: setPackageNameInStatusBar,
  checkSpecExistance:        checkSpecExistance,
  specStatusBar:             specStatusBar
}