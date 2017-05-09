const vscode           = require('vscode');
const path             = require('path');
const mkdirp           = require('mkdirp');
const fs               = require('fs');   
const assert           = require('assert');
const BeanCheckHandler = require('../bean_check_handler');

const NotClearFileContent = `
class DynamicClass
  bean :dynamic_class

  inject :project_repository
  inject :project_repository
  inject :project_creator
  inject :cache_system

  def do_anything_method
    project_repository.put(project_creator.create!)
  end
end
`;

const ClearFileContent = `
class DynamicClass
  bean :dynamic_class

  inject :project_repository
  inject :project_creator

  def do_anything_method
    project_repository.put(project_creator.create!)
  end
end
`;

describe("#beanCheckHandler", () => { 
  describe("if no duplicated or unused beans present", () => {
    const clearTestFile = path.join(__dirname, 'fixtures', 'clear_file.rb');
    
    before(() => {
      mkdirp.sync(path.dirname(clearTestFile));
      fs.appendFileSync(clearTestFile, ClearFileContent);
    });
    
    after(() => {
      fs.unlinkSync(clearTestFile);
    });

    it("not modifies file ", () => {
      return vscode.workspace.openTextDocument(clearTestFile).then(doc => {
        vscode.window.showTextDocument(doc).then((editor) => {
          BeanCheckHandler.commandHandler().then(() => {
            assert.equal(editor.document.getText(), ClearFileContent.toString());
          });
        });
      });
    });
  });

  describe("if duplicated or unused beans present", () => {
    const notClearTestFile = path.join(__dirname, 'fixtures', 'not_clear_file.rb');
    
    before(() => {
      mkdirp.sync(path.dirname(notClearTestFile));
      fs.appendFileSync(notClearTestFile, NotClearFileContent);
    });
    
    after(() => {
      fs.unlinkSync(notClearTestFile);
    });
    
    it("modifies file if duplicated or unused beans present", () => {
      return vscode.workspace.openTextDocument(notClearTestFile).then(doc => {
        vscode.window.showTextDocument(doc).then((editor) => {
          BeanCheckHandler.commandHandler().then(() => {
            assert.equal(editor.document.getText(), ClearFileContent.toString());
          });
        });
      });
    });
  });
});
