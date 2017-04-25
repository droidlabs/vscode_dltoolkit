const vscode = require('vscode');
const Locate = require('../locate/locate');

module.exports = class BeanProviderDefinition {
  constructor() {
    return {
      provideDefinition: (doc, pos) => {
        let textSelection = doc.getText(doc.getWordRangeAtPosition(pos)).replace(':', '');
        let bean          = this.getBeanRealName(doc, textSelection);
        const matches     = Locate.find(bean, ['bean']);

        return matches.map(m => new vscode.Location(vscode.Uri.file(m.file), new vscode.Position(m.line, m.char)));
      } 
    }
  }

  getBeanRealName(document, beanName) {
    const injectDefinitionRegex = new RegExp("inject\\s+:"+ beanName +",\\s+ref:\\s+:(\\w+)", "i");
    let beanRefirement = document.getText().split("\n").find(line => injectDefinitionRegex.test(line));
    let realBeanName = beanRefirement ? beanRefirement.match(injectDefinitionRegex)[1] : beanName;

    return realBeanName;
  }
}