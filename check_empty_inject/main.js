'use strict';

var values = require('object.values');

module.exports = function checkEmptyInject(document) {
  let definedBeansWithString  = {};
  let usedBeans               = [];

  const INJECT_DEFINITION_REGEX = new RegExp("inject\\s+:(\\w+)", "i");

  document.split("\n").forEach((string, lineNumber) => {
    if (INJECT_DEFINITION_REGEX.test(string)){
      let injectedBeanName  = string.match(INJECT_DEFINITION_REGEX)[1];

      definedBeansWithString[lineNumber] = injectedBeanName;
      return;
    }

    values(definedBeansWithString).forEach((bean) => {
      let injectUsage = new RegExp("\\W(" + bean + ").", "i");

      if (injectUsage.test(string)) {
        usedBeans.push(string.match(injectUsage)[1]);
      }
    });
  });

  let duplicatedBeans = values(definedBeansWithString).filter((item, index, array) => {
    return array.indexOf(item) != index;
  });

  let unusedBeans = values(definedBeansWithString).filter((defBean) => {
    return !~usedBeans.indexOf(defBean);
  });

  let stringsToDelete = []
  duplicatedBeans.forEach((dupItem) => {
    let line = -1;

    for (let index in definedBeansWithString) {
      if (definedBeansWithString[index] == dupItem) {
        line = index > line ? index : line;
      }
    }

    if (line > 0) stringsToDelete.push(line);
  });

  unusedBeans.forEach((dupItem) => {
    let line = -1;

    for (let index in definedBeansWithString) {
      if (definedBeansWithString[index] == dupItem) {
        line = index > line ? index : line;
      }
    }

    if (line > 0) stringsToDelete.push(line);
  });

  let uniqueStringsToDelete = stringsToDelete.filter((item, index, array) => { return array.indexOf(item) == index });

  return {
    duplicatedBeans:      duplicatedBeans,
    unusedBeans:          unusedBeans,
    stringsToDelete:      uniqueStringsToDelete
  }
}