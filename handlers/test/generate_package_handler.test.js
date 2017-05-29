const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const assert = require('assert');

const VscodeUtils            = require('../../utils/vscode_utils');
const FileUtils              = require('../../utils/file_utils');
const PackageUtils           = require('../../utils/package_utils');

const GeneratePackageHandler = require('../generate_package_handler');

describe("#generateNewPackage", () =>{
  describe("for existing folder", () => {
    let RdmContent;
    const RdmFilePath = PackageUtils.getRdmRootFile(vscode.workspace.rootPath);

    before(() => {
      RdmContent = fs.readFileSync(RdmFilePath).toString();
    });

    after(() => { 
      FileUtils.rimraf(path.join(__dirname, 'fixtures', 'entities'));
      fs.writeFileSync(RdmFilePath, RdmContent);
    });

    it("it asks package name and folder, create package in folder and goes to module file", () => {
      return new GeneratePackageHandler(
        VscodeUtils.showInputBoxTest("entities"),
        VscodeUtils.showQuickPickTest("/"),
        VscodeUtils.showInputBoxTest("")
      )().then(() => {
        return assert.equal(
          vscode.window.activeTextEditor.document.uri.path,
          path.join(__dirname, 'fixtures', 'entities', 'package', 'entities.rb')
        );
      });
    });
  });

  describe("for non existing folder", () => {
    let RdmContent;
    const RdmFilePath = PackageUtils.getRdmRootFile(vscode.workspace.rootPath);

    before(() => {
      RdmContent = fs.readFileSync(RdmFilePath).toString();
    });

    after(() => { 
      FileUtils.rimraf(path.join(__dirname, 'fixtures', 'core'));
      fs.writeFileSync(RdmFilePath, RdmContent);
    });

    it("asks package name and new folder path, creates folder, package in folder and goes to Package.rb", () => {
      return new GeneratePackageHandler(
        VscodeUtils.showInputBoxTest("entities"),
        VscodeUtils.showQuickPickTest("New folder"),
        VscodeUtils.showInputBoxTest("/core/domain/")
      )().then(() => {
        return assert.equal(
          vscode.window.activeTextEditor.document.uri.path,
          path.join(__dirname, 'fixtures', 'core', 'domain', 'entities', 'package', 'entities.rb')
        );
      });
    });
  });
});