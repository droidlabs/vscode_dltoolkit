const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const assert = require('assert');

const VscodeUtils         = require('../../utils/vscode_utils');
const GenerageBeanHandler = require('../generate_bean_handler');

const NewBeanFileContentCurrentPackage = 
`class CacheSystem::Services::NewCacheSystem
  bean :new_cache_system
end`;

const NewBeanFileContentOtherPackage = 
`class Project::NewProject
  bean :new_project
end`;

describe("#generateBeanHandler", () => {
  const CurrentOpenedFile = path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb');

  describe("if current package picked", () => {
    const NewBeanFilePath      = path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'services/new_cache_system.rb');
    
    after(() => { fs.unlinkSync(NewBeanFilePath) });
    
    describe("asks folder and bean name, creates bean file and", () => {
      const StepsToReproduce = () => vscode.workspace.openTextDocument(CurrentOpenedFile).then(doc => {
        return vscode.window.showTextDocument(doc).then(() => {
          return new GenerageBeanHandler(
            VscodeUtils.showQuickPickTest('Current package'),
            VscodeUtils.showQuickPickTest(),
            VscodeUtils.showQuickPickTest('/'),
            VscodeUtils.showInputBoxTest('cache_system/services/new_cache_system')
          )();
        });
      });
      
      it("goes to new file", () => {
        return StepsToReproduce().then(() => {
          return assert.equal(
            vscode.window.activeTextEditor.document.uri.path,
            NewBeanFilePath
          )
        });
      });

      it("creates new file with proper content", () => {
        return StepsToReproduce().then((editor) => {
          return assert.equal(
            editor.document.getText(),
            NewBeanFileContentCurrentPackage
          )
        });
      });
    });
  });

  describe("if other package picked", () => {
    const NewBeanFilePath  = path.join(__dirname, 'fixtures', 'project', 'package', 'project' ,'new_project.rb');

    after(() => { fs.unlinkSync(NewBeanFilePath) });

    describe("asks folder and bean name, creates bean file and goes to it", () => {
      const StepsToReproduce = () => vscode.workspace.openTextDocument(CurrentOpenedFile).then(doc => {
        return vscode.window.showTextDocument(doc).then(() => {
          return new GenerageBeanHandler(
            VscodeUtils.showQuickPickTest('Other package'), 
            VscodeUtils.showQuickPickTest('Project'), 
            VscodeUtils.showQuickPickTest('/'),
            VscodeUtils.showInputBoxTest('project/new_project')
          )();
        });
      });

      it("goes to new file", () => {
        return StepsToReproduce().then(() => {
          return assert.equal(
            vscode.window.activeTextEditor.document.uri.path,
            NewBeanFilePath
          )
        });
      });

      it("creates new file with proper content", () => {
        return StepsToReproduce().then((editor) => {
          return assert.equal(
            editor.document.getText(),
            NewBeanFileContentOtherPackage
          )
        });
      });
    });
  });
});