const vscode            = require('vscode');
const path              = require('path');
const assert            = require('assert');

const provideDefinition = require('../bean_provider_definition');

describe("#provideDefinition", function() {
  let result;

  vscode.workspace.openTextDocument(path.join(__dirname, 'fixtures', 'cache_system', 'package','cache_system.rb'))
    .then(document => { result = provideDefinition(document, new vscode.Position(4, 12)); },
          error    => { throw(new Error(error)); }
    );

  it("it returns array", () => {
    assert.equal(result.constructor.name, 'Array');
  });

  it("with 1 element for one bean definition", () => {
    assert.equal(result.length, 1);
  });

  it("with proper definition position", () => {
    assert.deepEqual(
      result[0]["range"], 
      {
        "_end": {
          "_character": 6,
          "_line": 1
        },
        "_start": {
          "_character": 6,
          "_line": 1
        }
      }
    )
  });
  
  it("with proper definition file uri", () => {
    assert.equal(
      result[0]["uri"]["path"], 
      path.join(__dirname, 'fixtures', 'project', 'package', 'project', 'project_creator.rb')
    );
  });
});