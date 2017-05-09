const chai   = require('chai');
const expect = chai.expect;

const path      = require('path');
const fs        = require('fs');
const BeanUtils = require('../bean_utils');

describe("class BeanUtils", () => {
  describe("#getBeanRealName", () => {
    describe("with :ref attribute", () => {
      const documentContent = fs.readFileSync(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'services', 'update_cache_for_project.rb')
      ).toString();

      expect(BeanUtils.getBeanRealName(documentContent, 'repository')).to.equal('project_repository');
    })

    describe("without :ref attribute", () => {
      const documentContent = fs.readFileSync(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'services', 'update_cache_for_project.rb')
      ).toString();

      expect(BeanUtils.getBeanRealName(documentContent, 'project_creator')).to.equal('project_creator');
    })
  });

  describe("#checkInjects", () => {
    describe("for duplicated beans", () => {
      const documentContent = fs.readFileSync(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'duplicated.rb')
      ).toString();

      it("returns name for duplicated injects and unique strings to delete", () => {
        expect(
          BeanUtils.checkInjects(documentContent)
        ).to.deep.eq(
          {
            duplicatedBeans: ['duplicated_examples'],
            unusedBeans:     [],
            stringsToDelete: [4,5]
          }
        )
      });
    });

    describe("for unused beans", () => {
      const documentContent = fs.readFileSync(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'unused.rb')
      ).toString();

      it("returns name for duplicated injects and unique strings to delete", () => {
        expect(
          BeanUtils.checkInjects(documentContent)
        ).to.deep.eq(
          {
            duplicatedBeans: [],
            unusedBeans:     ['unused_examples'],
            stringsToDelete: [3]
          }
        )
      });
    });

    describe("for duplicated and unused beans", () => {
      const documentContent = fs.readFileSync(
        path.join(__dirname, 'fixtures', 'cache_system', 'package', 'unused_duplicated.rb')
      ).toString();

      it("returns name for duplicated injects and unique strings to delete", () => {
        expect(
          BeanUtils.checkInjects(documentContent)
        ).to.deep.eq(
          {
            duplicatedBeans: ['duplicated_examples'],
            unusedBeans:     ['unused_examples'],
            stringsToDelete: [3,w5]
          }
        )
      });
    });
  });
});
