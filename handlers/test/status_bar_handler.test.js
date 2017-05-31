const vscode           = require('vscode');
const path             = require('path');
const assert           = require('assert');
const StatusBarHandler = require('../status_bar_handler');

describe("#setPackageNameInStatusBar", function() {
    it("sets status bar message if package detected", function() {
      return vscode.workspace.openTextDocument(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
      ).then(
        document => {
          StatusBarHandler.setPackageNameInStatusBar(document);
          
          return assert.equal(StatusBarHandler.packageNameStatusBarItem.text, "Package: CacheSystem");
        },
        error => { throw(new Error(error)) }
      );
    });
    
    it("unsets status bar message if no package detected", function() {
      return vscode.workspace.openTextDocument(
        path.join(__dirname, 'fixtures', 'file_without_package.rb')
      ).then(
        document => {
          StatusBarHandler.setPackageNameInStatusBar(document);
          return assert.equal(StatusBarHandler.packageNameStatusBarItem.text, '');        
        },
        error => { 
          throw(new Error(error));
        }
      );
    });
});

describe("#checkSpecExistance", () => {
  it("sets status bar message if spec file present", () => {
    return vscode.workspace.openTextDocument(
      path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
    ).then(
      document => {
        StatusBarHandler.checkSpecExistance(document);
        
        return assert.equal(StatusBarHandler.specStatusBar.text, "1 rspec files was found");
      },
      error => { throw(new Error(error)) }
    );
  });

  it("unsets status bar message if no package detected", function() {
    return vscode.workspace.openTextDocument(
      path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'no_spec_cache_system.rb')
    ).then(
      document => {
        StatusBarHandler.checkSpecExistance(document);
        
        return assert.equal(StatusBarHandler.specStatusBar.text, 'No rspec files was found');         
      },
      error => { 
        throw(new Error(error));
      }
    );
  });
});