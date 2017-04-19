# DLToolkit
___
### Description
A set of extensions for VisualStudio Code to comfortable work with ruby gems:
1. SmartIoc: [https://github.com/droidlabs/smart_ioc](https://github.com/droidlabs/smart_ioc)
2. RDM Packages: [https://github.com/droidlabs/rdm](https://github.com/droidlabs/rdm)
___
### Usage
##### 1. Goto bean definition
Feature allows user to jump to class, where bean service was defined. This works similar as default [VSCODE-RUBY](https://github.com/rubyide/vscode-ruby) plugin. To use it press cmd key and click to service name. Visual studio code open new file with class of injected service.
**HOTKEY** - cmd+(left click on service name)
##### 2. Goto spec definition
Feature allows user to jump to rspec which describes current file. This works with 2 modes.
**The first mode** works when name of current file is equal for it's rspec file (differences may include '_spec.rb' ending). If rspec file does not exist, UI gives you a choice to create new rspec file with default bootstrap.
**The second mode** works when there are many rspec files for current document and they are grouped at common folder. This way plugin shows you a dropdown list with addresses of all rspec files
**HOTKEY** - ctrl+cmd+r
##### 3. Delete unused dependencies
This feature allows user to parse current file and remove duplicated or unused dependecies. Also this works after save. If file include duplicated of unused injected beans plugin shows you warning with list of problem beans.
**HOTKEY** - ctrl+cmd+e