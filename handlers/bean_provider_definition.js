const vscode        = require('vscode');

const BeanUtils     = require('../utils/bean_utils');
const Locate        = require('../utils/locate_utils');

module.exports = function provideDefinition(doc, pos) {
  let textSelection = doc.getText(doc.getWordRangeAtPosition(pos)).replace(':', '');
  let bean          = BeanUtils.getBeanRealName(doc.getText(), textSelection);
  const matches     = Locate.find(bean, ['bean']);

  return matches.map(m => new vscode.Location(vscode.Uri.file(m.file), new vscode.Position(m.line, m.char)));
} 