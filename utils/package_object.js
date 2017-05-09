const path   = require('path');
const fs     = require('fs');

const StringUtils = require('./string_utils');

module.exports = class PackageObject {

  // @option path_to_package [String], absolute package folder path, 
  //    ex: /User/project/droidlabs_toolkit/subsystems/cache_system/
  // @return [PackageObject]
  constructor(path_to_package) {
    this.pathToPackage  = path_to_package;
    this.name           = this._extractName()

    return this;
  }

  // @option []
  // @return [String], absolute path to module namespace file, 
  //    ex: /User/project/droidlabs_toolkit/subsystems/cache_system/package/cache_system.rb
  pathToModuleFile() {
    const moduleName   = `${this.name}.rb`;
    const nestedFolder = 'package';

    return path.join(this.pathToPackage, nestedFolder, moduleName);
  }

  pathToPackageFile() {
    const RDM_PACKAGE_FILE = 'Package.rb';

    return path.join(this.pathToPackage, RDM_PACKAGE_FILE);
  }

  // @option []
  // @return [String], humanized name of selected package, 
  //    ex: 'CacheSystem'
  humanName() {
    return StringUtils.classify(this.name);
  }

  // @option []
  // @return [String], absolute path to package folder, 
  //    ex: '/User/project/droidlabs_toolkit/subsystems/cache_system/'
  location() {
    return this.pathToPackage;
  }

  // @option [String], path to 'Package.rb' at package folder, 
  //    ex: /User/project/droidlabs_toolkit/subsystems/cache_system/Package.rb
  // @return [String], #name method argument inside package do...end block at Package.rb file, 
  //    ex: 'cache_system'
  _extractName() {
    if (!fs.existsSync(this.pathToPackageFile())) throw new Error("Package.rb not found");

    const PackageNameRegex = new RegExp("package\\s+do.*?name\\s+['\"]([^'\"]+)['\"].*?end", "i");
    
    return fs.readFileSync(this.pathToPackageFile())
      .toString()
      .split("\n").join(";")
      .split("{").join("do")
      .split("}").join("end")
      .match(PackageNameRegex)[1];
  }
}