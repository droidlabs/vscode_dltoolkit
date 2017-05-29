const fs    = require('fs');
const path  = require('path');

module.exports = class FileUtils {
  static getFilesListForDirectory(dir) {
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
      if (/^\..*/i.test(file)) return;
      file = path.join(dir, file)

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
    let defineClassRegex = /class ([\w\d:]+)/i

    for (let i=0;i<document.lineCount;i++) {
        let line = document.lineAt(i).text;

        if (defineClassRegex.test(line)) {
            return line.match(defineClassRegex)[1]
        }
    }
  }

  static rimraf(dir_path) {
    if (fs.existsSync(dir_path)) {
      fs.readdirSync(dir_path).forEach(function(entry) {
        var entry_path = path.join(dir_path, entry);
        if (fs.lstatSync(entry_path).isDirectory()) {
          FileUtils.rimraf(entry_path);
        } else {
          fs.unlinkSync(entry_path);
        }
      });
      fs.rmdirSync(dir_path);
    }
  }
}