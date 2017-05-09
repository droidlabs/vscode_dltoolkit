var assert      = require('assert');
var StringUtils = require('../string_utils');

describe("class StringUtils", () => {
  describe("#getRubyClassNameFromPath", function() {
    it("returns ruby class for path without folder", function() {
      assert.equal(StringUtils.getRubyClassNameFromPath('project.rb'), 'Project');
    });

    it("returns ruby class for path with folder", function() {
      assert.equal(StringUtils.getRubyClassNameFromPath('/entities/project_comment.rb'), 'Entities::ProjectComment');
    });
  });

  describe("#capitalize", function() {
    it("it capitalizes string", function() {
        assert.equal(StringUtils.capitalize('test_string'), 'Test_string');
    });
  });
});