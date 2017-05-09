module.exports = class BeanUtils {
  // @options 
  //    documentContent[String], text of document to search, ex: "class CacheSystem\n inject :system, ref: :cache_system ..."
  //    beanName[String], name of bean looking for, ex: "system"
  // @returns [String], ref bean name if present, ex: "cache_system"
  static getBeanRealName(documentContent, beanName) {
    const injectDefinitionRegex = new RegExp("inject\\s+:"+ beanName +",\\s+ref:\\s+:(\\w+)", "i");

    let beanRefirement = documentContent.split("\n").find(line => injectDefinitionRegex.test(line));
    let realBeanName   = beanRefirement ? beanRefirement.match(injectDefinitionRegex)[1]: beanName;

    return realBeanName;
  }

  // @options documentContent[String], text of document to search, 
  //    ex: "class CacheSystem\n inject :system, ref: :cache_system ..."
  // @returns [Object], information about unused and duplicated beans and string need to delete,
  // ex: 
  // {
  //    duplicatedBeans:      [cache_system, project_creator],
  //    unusedBeans:          [project_creator],
  //    stringsToDelete:      [1,3,4]
  // }
  static checkInjects(documentContent) {
    const INJECT_DEFINITION_REGEX = new RegExp("inject\\s+:(\\w+)", "i");
    
    let definedBeansWithString  = {};
    let usedBeans               = [];


    documentContent.split("\n").forEach((string, lineNumber) => {
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
      duplicatedBeans: duplicatedBeans,
      unusedBeans:     unusedBeans,
      stringsToDelete: uniqueStringsToDelete
    }
  }
}