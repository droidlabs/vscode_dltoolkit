const chai   = require('chai');
const expect = chai.expect;

var path          = require('path');
var PackageObject  = require('../package_object');

describe("class PackageObject", () => {
  describe("#constructor", () => {
    it("returns self", () => {
      expect(
        new PackageObject(path.join(__dirname, 'fixtures', 'cache_system')).constructor.name
      ).to.equal('PackageObject');
    });

    it("initializes new instanse with proper attributes", () => {
      let pkg = new PackageObject(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg.pathToPackage).to.equal(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg.name).to.equal('cache_system')
    });
  });

  describe("#pathToModuleFile", () => {
    it("returns path to package module file if exists", () => {
      let pkg = new PackageObject(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg.pathToModuleFile()).to.equal(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'cache_system.rb')
      );
    });
  });

  describe("#humanName", () => {
    it("returns human name for package", () => {
      let pkg = new PackageObject(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg.humanName()).to.equal('CacheSystem');
    });
  });

  describe("#location", () => {
    it("returns absolute path to package", () => {
      let pkg = new PackageObject(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg.location()).to.equal(path.join(__dirname, 'fixtures', 'cache_system'));
    });
  });

  describe("#_extractName", () => {
    it("returns #name attribute from pacakge do..end block", () => {
      let pkg = new PackageObject(path.join(__dirname, 'fixtures', 'cache_system'));
      expect(pkg._extractName()).to.equal('cache_system');
    });
  });
});
