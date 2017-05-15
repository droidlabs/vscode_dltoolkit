const path   = require('path');
const fs     = require('fs');

const PackageObject = require('./package_object');

const RDM_PROJECT_FILE = 'Rdm.packages';

module.exports = class PackageUtils {
  // @option root [String], absolute project folder path, ex: /User/project/droidlabs_toolkit/subsystems/cache_system/
  // @return [String], ex: /User/project/droidlabs_toolkit/Rdm.packages
  static getRdmRootFile(root) {
    let rdmPackagesFile = path.join(root, RDM_PROJECT_FILE);

    if (fs.existsSync(rdmPackagesFile)) return rdmPackagesFile;

    let parentDir = path.resolve(root, '../');
    if (root == parentDir) {
      throw new Error("Rdm.packages was not found. Run 'rdm init' for initial setup");
    }

    return PackageUtils.getRdmRootFile(parentDir);
  }

  // @option root [String], absolute file path, ex: /User/project/droidlabs_toolkit/subsystems/cache_system/
  // @return [ArrayOf(PackageObject)], ex: [new PackageObject(), new PackageObject()]
  static getRdmPackagesList(root) {
    const RdmPackageDefifitionRegex = new RegExp("\\s*package\\s*\'([\\w\/]+)\'", "i");
      
    return fs.readFileSync(PackageUtils.getRdmRootFile(root))
      .toString()
      .split("\n")
      .filter(line => RdmPackageDefifitionRegex.test(line))
      .map(line => {
        const RdmProjectAbsolutePath = path.dirname(PackageUtils.getRdmRootFile(root));
        const RdmPackageRelativePath = line.match(RdmPackageDefifitionRegex)[1];
        
        const packageAbsoluteUri = path.join(RdmProjectAbsolutePath, RdmPackageRelativePath);

        return new PackageObject(packageAbsoluteUri);
      });
  }

  // @option path_to_file [String], absolute path to sample file which belongs to some Rdm Package, 
  //    ex: /User/project/droidlabs_toolkit/subsystems/cache_system/package/cache_system/services/update_cache_for_project.rb
  // @return [PackageObject]
  static getRdmPackageForFile(path_to_file) {
    return PackageUtils.getRdmPackagesList(path_to_file).find(
      pkg => ~path_to_file.indexOf(pkg.location())
    );
  }
}

