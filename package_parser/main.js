'use strict';

const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');

module.exports = class PackageParser {
  constructor() {
    this.packageDefinitionRegexp = new RegExp("\\s*package\\s*\'([\\w\/]+)\'", "i");
    this.document = fs.readFileSync(path.join(vscode.workspace.rootPath, 'Rdm.packages')).toString();
  }
  getCurrentPackage(uri) {
    return this.getPackageList().find(packageItem => ~uri.path.toString().indexOf(packageItem));
  }
  getPackageList() {
    return this.document.split("\n").filter(string => this.packageDefinitionRegexp.test(string))
                                    .map(string => string.match(this.packageDefinitionRegexp)[1]);
  }
}