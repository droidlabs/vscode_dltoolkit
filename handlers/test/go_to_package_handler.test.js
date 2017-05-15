const vscode = require('vscode');
const path   = require('path');
const assert = require('assert');

const VscodeUtils        = require('../../utils/vscode_utils');
const GoToPackageHandler = require('../go_to_package_handler');

describe("#goToPackageHandler", () => {
  it("ask to choose package and file inside package and go to this file", () => {
    return new GoToPackageHandler(
      VscodeUtils.showQuickPickTest("CacheSystem"), 
      VscodeUtils.showQuickPickTest("package/cache_system/multispec_cache_system.rb")
    )().then(() => {
      return assert.equal(
        vscode.window.activeTextEditor.document.uri.path,
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'multispec_cache_system.rb')
      )
    });
  });
});