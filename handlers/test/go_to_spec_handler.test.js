const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const assert = require('assert');

const GoToSpecHandler = require('../go_to_spec_handler');

describe("#goToSpecHandler", () => {
  describe("from spec file to described class", () => {
    const SpecFilePath = path.join(__dirname, 'fixtures', 'cache_system', 'spec', 'cache_system_spec.rb');

    it("goes to described class if exists", () => {
      return vscode.workspace.openTextDocument(SpecFilePath).then((doc) => {
        return vscode.window.showTextDocument(doc).then(() => {
          return GoToSpecHandler().then(() => {
            return assert.equal(
              vscode.window.activeTextEditor.document.uri.path,
              path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
            );
          });
        });
      });
    });
  });

  describe("from described class to spec file if exists", () => {
    describe("if folder exists", () => {
      const FileWithMultipleSpecsPath = path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'multispec_cache_system.rb');

      it("returns list of file at folder", () => {
        return vscode.workspace.openTextDocument(FileWithMultipleSpecsPath).then((doc) => {
          return vscode.window.showTextDocument(doc).then(() => {
            return assert.deepEqual(
              GoToSpecHandler(),
              [
                'get_cache_system_spec.rb',
                'update_cache_system_spec.rb'
              ]
            );
          });
        });
      });
    });

    describe("if file exists", () => {
      const FileWithSingleSpecPath = path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb');

      it("goes to spec file", () => {
        return vscode.workspace.openTextDocument(FileWithSingleSpecPath).then((doc) => {
          return vscode.window.showTextDocument(doc).then(() => {
            return GoToSpecHandler().then(() => {
              return assert.equal(
                vscode.window.activeTextEditor.document.uri.path,
                path.join(__dirname, 'fixtures', 'cache_system', 'spec', 'cache_system_spec.rb')
              );
            });
          });
        });
      });
    });
  });

  describe("from described class to spec file if not exists", () => {
    const NewSpecForFilePath  = path.join(__dirname, 'fixtures', 'cache_system', 'spec', 'cache_system', 'no_spec_cache_system_spec.rb');
    const FileWithoutSpecPath = path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system', 'no_spec_cache_system.rb')

    after(() => { fs.unlinkSync(NewSpecForFilePath) });

    it("creates spec with proper folder structure", () => {
      return vscode.workspace.openTextDocument(FileWithoutSpecPath).then((doc) => {
        return vscode.window.showTextDocument(doc).then(() => {
          return GoToSpecHandler().then(() => {
            return assert.equal(
              vscode.window.activeTextEditor.document.uri.path,
              NewSpecForFilePath
            );
          });
        });
      });
    });
  });
});