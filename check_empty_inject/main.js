'use strict';

module.exports = function checkEmptyInject(document) {
  let definedBeansWithString  = {};
  let usedBeans               = [];

  const INJECT_DEFINITION_REGEX = new RegExp("inject\\s+:(\\w+)", "i");

  document.split("\n").forEach((string, lineNumber) => {
    if (INJECT_DEFINITION_REGEX.test(string)){
      let injectedBeanName  = string.match(INJECT_DEFINITION_REGEX)[1];

      definedBeansWithString[injectedBeanName] = definedBeansWithString[injectedBeanName] || [];
      definedBeansWithString[injectedBeanName].push(lineNumber);
      return;
    }

    for (let bean in definedBeansWithString) {
      let injectUsage = new RegExp("[\\s|\\W]*(" + bean + ")[\\s|\\W]*", "i");

      if (injectUsage.test(string)) {
        usedBeans.push(string.match(injectUsage)[1]);
      }
    }
  });

  let duplicatedBeans = [];
  let unusedBeans     = [];
  let stringsToDelete = [];

  for (let bean in definedBeansWithString) {
    if (!~usedBeans.indexOf(bean)) {
      unusedBeans.push(bean);
      
      stringsToDelete = stringsToDelete.concat(definedBeansWithString[bean]);
    }

    if (definedBeansWithString[bean].length > 1) {
      duplicatedBeans.push(bean);

      stringsToDelete = stringsToDelete.concat(
        definedBeansWithString[bean].sort().slice(1)
      );
    }
  }

  let uniqueStringsToDelete = stringsToDelete.filter((item, index, array) => { return array.indexOf(item) == index });

  return {
    duplicatedBeans:      duplicatedBeans,
    unusedBeans:          unusedBeans,
    stringsToDelete:      uniqueStringsToDelete
  }
}