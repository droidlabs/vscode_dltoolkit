const BeanProviderDefinition = require('./beanProviderDefinition');
const FindBeanUsageCommand   = require('./findBeanUsageCommand');
const GoToPackageCommand     = require('./goToPackageCommand');
const ShowAllBeansCommand    = require('./showAllBeansCommand');
const GeneratePackageCommand = require('./generatePackageCommand');
const GenerateBeanCommand    = require('./generateBeanCommand');

class CommandList {
  constructor() {}

  buildBeanProviderDefinition()       { return new BeanProviderDefinition(); }
  findBeanUsageCommand()              { return new FindBeanUsageCommand(); }
  goToPackageCommand()                { return new GoToPackageCommand(); } 
  showAllBeansCommand()               { return new ShowAllBeansCommand(); }
  generatePackageCommand()            { return new GeneratePackageCommand(); }
  generateBeanCommand()               { return new GenerateBeanCommand(); }
}

module.exports = new CommandList();