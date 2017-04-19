'use strict';

module.exports = function packageParser(textDocument) {
  const packageDefinitionRegexp = new RegExp("\\s*package\\s*\'([\\w\/]+)\'", "i");
  
  let result = textDocument.split("\n").filter((string) => {
    return packageDefinitionRegexp.test(string);
  });

  return result.map(item => {
    return item.match(packageDefinitionRegexp)[1]
  });
}