const BeanProviderDefinition = require('./beanProviderDefinition');
const FindBeanUsageCommand   = require('./findBeanUsageCommand');
const GoToPackageCommand     = require('./goToPackageCommand');
const ShowAllBeansCommand     = require('./showAllBeansCommand');

class CommandList {
  constructor() {}

  buildBeanProviderDefinition()       { return new BeanProviderDefinition(); }
  findBeanUsageCommand()              { return new FindBeanUsageCommand(); }
  goToPackageCommand()                { return new GoToPackageCommand(); } 
  showAllBeansCommand()                { return new ShowAllBeansCommand(); } 
}

module.exports = new CommandList();