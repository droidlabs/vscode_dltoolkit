const vscode = require('vscode');
const path   = require('path');
const assert = require('assert');

const VscodeUtils          = require('../../utils/vscode_utils');
const ShowAllBeansHandler  = require('../show_all_beans_handler');

describe("#showAllBeansHandler", () => {
  it("goes to package if picked", () => {
    return new ShowAllBeansHandler(VscodeUtils.showQuickPickTest("1. Package: CacheSystem"))()
      .then(() => {
        return assert.equal(
          vscode.window.activeTextEditor.document.uri.path, 
          path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
        )
      });
  });

  it("goes to bean if picked", () => {
    return new ShowAllBeansHandler(VscodeUtils.showQuickPickTest("    1.2. multispec_cache_system"))()
      .then(() => {
        return assert.equal(
          vscode.window.activeTextEditor.document.uri.path, 
          path.join(__dirname, 'fixtures', 'cache_system', 'package', 'multispec_cache_system.rb')
        )
      });
  });
});