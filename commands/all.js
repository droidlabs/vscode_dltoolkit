const BeanProviderDefinition = require('./beanProviderDefinition');
const FindBeanUsageCommand   = require('./findBeanUsageCommand');
const GoToPackageCommand     = require('./goToPackageCommand');
const ShowAllBeansCommand    = require('./showAllBeansCommand');
const GeneratePackageCommand = require('./generatePackageCommand');

class CommandList {
  constructor() {}

  buildBeanProviderDefinition()       { return new BeanProviderDefinition(); }
  findBeanUsageCommand()              { return new FindBeanUsageCommand(); }
  goToPackageCommand()                { return new GoToPackageCommand(); } 
  showAllBeansCommand()               { return new ShowAllBeansCommand(); }
  generatePackageCommand()            { return new GeneratePackageCommand(); }
}

module.exports = new CommandList();