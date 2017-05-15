# DLToolkit
___
### Description
A set of extensions for VisualStudio Code to comfortable work with ruby gems:
1. SmartIoc: [https://github.com/droidlabs/smart_ioc](https://github.com/droidlabs/smart_ioc)
2. RDM Packages: [https://github.com/droidlabs/rdm](https://github.com/droidlabs/rdm)
___
### Использование
##### 1. Goto Bean Definition
Использование [гема RDM](https://github.com/droidlabs/rdm) вводит в проект такие понятия как определение зависимости (метод #bean) и инъекция зависимости (метод #inject). Однако стандартные возможности расширения [VSCODE-RUBY](https://github.com/rubyide/vscode-ruby) не позволяют быстро переходить к определению той или иной зависимости, т.к. эти методы не являются стандартными для ruby. Vscode-DLToolkit позволяет расширяет возможности плагина Vscode-Ruby, позволяя при помощи стандартного метода редактора GoToDefinition (Перейти к определению) открывать классы, содержащие определение используемой зависимости.
**Пример:**
```ruby
# cache_system.rb
class CacheSystem
  bean :cache_system

  inject :repository, ref: :project_repository
  inject :mailing_system

  def handle(project_id:)
    mailing_system.send_for_project(
      project_repository.get(project_id)
    )
  end
end
```
Переход к определению будет работать как для аргументов метода #inject, так и для использования зависимостей внутри класса.
**HOTKEY** - cmd+(left click on service name) or F12

##### 2. Goto Spec Definition
Тестирование- неотъемлемая часть разработки, и гем RDM подразумевает, что вы будете тестировать классы ваших пакетов. Для этого каждый пакет имеет в своей корневой директории отделенную от папки /package папку /spec. Vscode-DLToolkit знает об этом и позволяет вам быстро попадать из класса в соответствующий тест и обратно. При переходе в тест подразумевается, что файл с тестом имеет точно такой же путь относительно папки /spec, какой имеет файл с тестируемым классом относительно папки /package в корневой директории пакета.

Команда умеет выполняться в 3 режимах:
**Режим 1: Переход между тестируемым классом и тестом** Файл с тестом имеет такой же путь относительно папки /spec, как и тестируемый класс относительно папки /package. Файл с тестом 
содержит приставку '_spec.rb' вместо простого расширения файла. В таком случае использование плагина будет отправлять нас из теста в тестируемый класс и наоборот.
**Пример соответствия файлов:** 
> /package/cache_system/cache_system_updater.rb 
> <=> 
> /spec/cache_system/cache_system_updater_spec.rb

**Режим 2: Переход между тестируемым классом и группой тестов** Иногда возникает необоходимость описать один класс группой тестов. В этом режиме при переходе из тестируемого класса в тест появляется выпадающее окно со списком тестов для данного класса. При поиске тестов подразумевается, что в папке /spec они будут лежать в папке, название которой совпадает с названием тестируемого файла. При переходе из теста работает аналогично с режимом 1.
**Пример соответствия файлов:** 
> /package/cache_system.rb 
> <=> 
> [
>  /spec/cache_system/update_cache_spec.rb,
>  /spec/cache_system/delete_cache_spec.rb
> ]

**Режим 3: Создание теста для класса** В том случае, если команда будет вызвана и не найдет ни папки с тестами, ни одночного теста, она выведет оповещение об этом и предложит создать одиночный тест. Если вы дадите согласие на создание нового теста, будет создан новый файл в папке /spec, в него будет вставлен шаблонный текст и редактор откроет этот файл для редактирования.
**HOTKEY** - ctrl+cmd+R

##### 3. Find unused and duplicated dependencies
При использовании большого количества зависимостей внутри одного файла становится сложно следить за всем списком зависимых компонентов. Для этого каждый раз когда вы сохраняете файл с расширением .rb (за исключением _spec.rb файлов) расширение анализирует список зависимостей, находит дубликаты и зависимости, которые не используются и выводит об этом оповещение. При вызове команды, строки, содержащие эти зависимости, будут удалены.
**Пример:**
До использования расширения:
```ruby
# cache_system.rb
class CacheSystem
  bean :cache_system

  inject :duplicated_repository
  inject :duplicated_repository # will be removed as duplicated
  inject :repository, ref: :duplicated_repository
  inject :unused_dependency     # will be removed as unused

  def handle
    duplicated_repository.some_method_calling
    repository.some_method_calling
  end
end
```
После использования расширения:
```ruby
# cache_system.rb
class CacheSystem
  bean :cache_system

  inject :duplicated_repository
  inject :repository, ref: :duplicated_repository

  def handle
    duplicated_repository.some_method_calling
    repository.some_method_calling
  end
end
```
**HOTKEY** - ctrl+cmd+E

##### 4. Goto Package
В больших проектах появляется большое количество пакетов (спасибо, Кеп) и ориентироваться среди большой кучи папок становится довольно сложно. Для упрощения работы
расширение дает возможность для быстрой навигации по пакетам. Команда выводит список всех пакетов во всплывающем окне. При выборе пакета выводится список всех файлов (не скрытых, т.е. название
которых начинается не с точки) с возможностью открытия любого из них в новой вкладке.
**HOTKEY** - ctrl+cmd+P

##### 5. Show Package name in StatusBar
Для того, чтобы каждый раз не искать, в каком пакете мы находимся, в левой части статус бара выводится название текущего пакета

##### 6. Show all existing dependencies (Beans)
Показывает в выпадающем окне все существующие в проекте зависимости, сгруппированные по пакетам. При выборе зависимости (bean) открывает файл с зависимостью в новой вкладке, при выборе пакета
открывает главный файл внутри пакета (название файла совпадает с названием пакета)
**HOTKEY** - ctrl+cmd+B

##### 7. Show all used dependencies (Beans)
Команда работает аналогично показу всех существующих бинов, однако разница состоит в том, что список используемых бинов ограничен используемыми зависимостями в открытом файле. Если открытого файла нету, расширение сообщит, что вы зачем-то импровизируете. А зря.
**HOTKEY** - ctrl+cmd+I

##### 8. Create new Bean
Если предыдущих возможностей по поиску зависимостей вам мало и вы хотите создать свою собственную, расширение сделает это за вас. При запуске команды вам нужно будет ответить на несколько вопросов касательно конфигурации Бина (Bean), а именно:
* Создавать бин (bean) в текущем пакете (package) или в другом
* Если в другом, то в каком
* В какой папке создать зависимость
* Как назвать зависимость
После этого расширение создаст нужный файл и откроет его в новой вкладке. Profit!
**HOTKEY** - ctrl+cmd+N

##### 9. Create new Package
В случае, если отдельной зависимости вам мало и вы хотите создать целый пакет, расширение может сделать за вас всю работу. Но естественно мы будем делать ее не сами, а переложим всю работу на гем RDM. Поэтому если вы еще не установили его, то настоятельно советуем вам открыть консольку и набрать:
> gem install rdm
> cd path/to/my/project
> rdm init
При вызове фичи у вам предложат выбрать имя пакета и папку, в которой он будет храниться (из вариантов - создать свою или посмотреть существующие папки с пакетами в Rdm.packages в корне вашего проекта), после чего будет вызвана команда 
> bundle exec rdm gen.package #{ИМЯ_ВАШЕГО_ПАКЕТА} --path=#{ПАПКА_КОТОРУЮ_ВЫ_ВЫБРАЛИ}
После создания пакета, его основной файл (файл, название которого совпадает с названием пакета) будет открыт в новой вкладке
**HOTKEY** - ctrl+cmd+G