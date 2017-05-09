const vscode        = require('vscode');

const PackageUtils = require('../utils/package_utils');

const PACKAGE_NAME_PRIORITY = 100;
const statusBar             = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, PACKAGE_NAME_PRIORITY);

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

module.exports = {
  packageNameStatusBarItem:  statusBar,
  setPackageNameInStatusBar: setPackageNameInStatusBar
}