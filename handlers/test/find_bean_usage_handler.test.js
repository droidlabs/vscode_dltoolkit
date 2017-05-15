const vscode = require('vscode');
const path   = require('path');
const assert = require('assert');

const VscodeUtils          = require('../../utils/vscode_utils');
const FindBeanUsageHandler = require('../find_bean_usage_handler');

describe("#findBeanUsageHandler", () => {
  it("goes to package if picked", () => {
    const FileWithInjectedDependencies = path.join(__dirname, 'fixtures', 'project', 'package', 'project', 'project_repository.rb');

    return vscode.workspace.openTextDocument(FileWithInjectedDependencies).then((doc) => {
      return vscode.window.showTextDocument(doc).then(() => {
        return new FindBeanUsageHandler(VscodeUtils.showQuickPickTest("1. Package: CacheSystem"))()
          .then(() => {
            return assert.equal(
              vscode.window.activeTextEditor.document.uri.path, 
              path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
            )
          });
      });
    });
  });

  it("goes to bean if picked", () => {
    const FileWithInjectedDependencies = path.join(__dirname, 'fixtures', 'project', 'package', 'project', 'project_repository.rb');

    return vscode.workspace.openTextDocument(FileWithInjectedDependencies).then((doc) => {
      return vscode.window.showTextDocument(doc).then(() => {
        return new FindBeanUsageHandler(VscodeUtils.showQuickPickTest("    1.2. multispec_cache_system"))()
          .then(() => {
            return assert.equal(
              vscode.window.activeTextEditor.document.uri.path, 
              path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'multispec_cache_system.rb')
            )
          });
      });
    });
  });
});