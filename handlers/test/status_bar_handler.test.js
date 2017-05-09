const vscode           = require('vscode');
const path             = require('path');
const assert           = require('assert');
const StatusBarHandler = require('../status_bar_handler');

describe("#setPackageNameInStatusBar", function() {
    it("sets status bar message if package detected", function() {
      vscode.workspace.openTextDocument(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
      ).then(
        document => {
          StatusBarHandler.setPackageNameInStatusBar(document);
          
          assert.equal(StatusBarHandler.packageNameStatusBarItem.text, "Package: CacheSystem");
        },
        error => { throw(new Error(error)) }
      );
    });
    
    it("unsets status bar message if no package detected", function(done) {
      vscode.workspace.openTextDocument(
        path.join(__dirname, 'fixtures', 'file_without_package.rb')
      ).then(
        document => {
          StatusBarHandler.setPackageNameInStatusBar(document);
          done();          
        },
        error => { 
          throw(new Error(error));
        }
      );

      assert.equal(StatusBarHandler.packageNameStatusBarItem.text, undefined);
    });
});