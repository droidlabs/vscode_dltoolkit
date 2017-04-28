const fs = require('fs');
const path = require('path');

class Utils {
  constructor() {}

  getFilesListForDirectory(dir) {
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
      file = dir + '/' + file
      var stat = fs.statSync(file)
      if (stat && stat.isDirectory()) results = results.concat(this.getFilesListForDirectory(file))
      else results.push(file)
    });

    return results;
  }

  getFoldersForDirectory(root) {
    var self = this;
    var results = [];
    var list = fs.readdirSync(path.join(root));

    list.forEach(function(directory) {
      directory = root + '/' + directory
      var stat = fs.statSync(directory)
      if (stat && stat.isDirectory()) {
        results.push(directory);
        results = results.concat(self.getFoldersForDirectory(directory));
      }
    });

    return results;
  }

  classify(snake_case) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    let result = snake_case.replace(/.rb$/, '');

    result = result.replace(/[\-_^\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });

    result = result.replace(/[\/\s]+(.)?/g, function(match, chr) {
        return '::' + (chr ? chr.toUpperCase() : '');
    });

    return capitalizeFirstLetter(result)
  }
}

module.exports = new Utils();