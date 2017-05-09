const fs = require('fs');
const path = require('path');

module.exports = class FileUtils {
  static getFilesListForDirectory(dir) {
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
      file = dir + '/' + file
      var stat = fs.statSync(file)
      if (stat && stat.isDirectory()) results = results.concat(FileUtils.getFilesListForDirectory(file))
      else results.push(file)
    });

    return results;
  }

  static getFoldersForDirectory(root) {
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

  static getClassName(document) {
    let defineClassRegex = /class ([a-zA-Z:]+)/i

    for (let i=0;i<document.lineCount;i++) {
        let line = document.lineAt(i).text;

        if (defineClassRegex.test(line)) {
            return line.match(defineClassRegex)[1]
        }
    }
  }
}