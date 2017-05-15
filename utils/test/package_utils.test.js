const chai   = require('chai');
const expect = chai.expect;

var path          = require('path');
var PackageUtils  = require('../package_utils');

describe("class PackageUtils", () => {
  describe("#getRdmPackageForFile", () => {
    it("returns PackageObject instance", () => {
      expect(
        PackageUtils.getRdmPackageForFile(
          path.join(__dirname, 'fixtures', 'cache_system', 'services', 'update_cache_for_project')
        ).constructor.name
      ).to.equal('PackageObject');
    });

    it("returns PackageObject with proper name attribute", () => {
      expect(
        PackageUtils.getRdmPackageForFile(path.join(__dirname, 'fixtures', 'entities')).name
      ).to.equal('entities');
    });

    it("returns undefined if package was not found", () => {
      expect( 
        PackageUtils.getRdmPackageForFile(path.join(__dirname, 'fixtures'))
      ).eql(undefined);
    });
  });

  describe("#getRdmRootFile", () => {
    it("returns Rdm.packages file in parent directory", () => {
      expect(
        PackageUtils.getRdmRootFile(path.join(__dirname, 'fixtures', 'entities'))
      ).to.equal(path.join(__dirname, 'fixtures', 'Rdm.packages'));
    });

    it("return current folder if Rdm.packages present", () => {
      expect(
        PackageUtils.getRdmRootFile(path.join(__dirname, 'fixtures'))
      ).to.equal(path.join(__dirname, 'fixtures', 'Rdm.packages'));
    });

    it("throws error if Rdm.packages was not found before system root was reached", () => {
      expect(
        () => { PackageUtils.getRdmRootFile(__dirname) }
      ).to.throw(Error, "Rdm.packages was not found. Run 'rdm init' for initial setup");
    });
  });

  describe("#getRdmPackagesList", () => {
    it("returns array of 2 elements for 2 packages", () => {
      expect(
        PackageUtils.getRdmPackagesList(path.join(__dirname, 'fixtures')).length
      ).to.equal(2);
    });
    it("returns array of PackageObject class", () => {
      expect(
        PackageUtils.getRdmPackagesList(path.join(__dirname, 'fixtures'))[0].constructor.name
      ).to.equal('PackageObject');
    })
  });
});