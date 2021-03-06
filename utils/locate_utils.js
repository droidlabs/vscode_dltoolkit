const locator   		= require('../ruby-method-locate/main'),
	    minimatch 		= require('minimatch'),
      fs        		= require('fs'),
	    path      		= require('path'),
      _         		= require('lodash'),
			PackageUtils 	= require('../utils/package_utils');

const vscode = require('vscode');

const DECLARATION_TYPES = ['class', 'module', 'method', 'classMethod', 'bean', 'inject'];

function flatten(locateInfo, file, containerName = '', containerBean) {
	return _.flatMap(locateInfo, (symbols, type) => {
		if (!_.includes(DECLARATION_TYPES, type)) {
			// Skip top-level include or posn property etc.
			return [];
		}
		return _.flatMap(symbols, (inner, name) => {
			const posn          = inner.posn || { line: 0, char: 0 };

			const symbolInfo = {
				name: name,
				type: type,
				file: file,
				line: posn.line,
				char: posn.char,
				containerName: containerName || '',
				containerBean: containerBean,
				package: PackageUtils.getRdmPackageForFile(file)
			};
			_.extend(symbolInfo, _.omit(inner, DECLARATION_TYPES));
			const sep = { method: '#', classMethod: '.' }[type] || '::';
			const fullName = containerName ? `${containerName}${sep}${name}` : name;
			
			let parentBean;
			if (inner.bean) {
				parentBean = _.findKey(inner.bean, 'posn');
			}

			return [symbolInfo].concat(flatten(inner, file, fullName, parentBean));
		});
	});
}
class Locate {
	constructor() {
		this.settings = vscode.workspace.getConfiguration("ruby.locate");
		this.root     = path.dirname(PackageUtils.getRdmRootFile(vscode.workspace.rootPath));
		this.tree     = {};
		// begin the build ...
		this.walk(this.root);
		// add edit hooks
		// always: do this file now (if it's in the tree)
		// add lookup hooks
	}
	listInFile(absPath) {
		const waitForParse = (absPath in this.tree) ? Promise.resolve() : this.parse(absPath);
		return waitForParse.then(() => _.clone(this.tree[absPath] || []));
	}
	find(name, type) {
		// because our word pattern is designed to match symbols
		// things like Gem::RequestSet may request a search for ':RequestSet'

		const escapedName = name ? _.escapeRegExp(_.trimStart(name, ':')) : '.*';
		const regexp = new RegExp(`^${escapedName}?\$`);
		const allowedTypes = type || ['class', 'module', 'method', 'classMethod'];

		return _(this.tree)
			.values()
			.flatten()
      .filter(symbol => { return regexp.test(symbol.name) && allowedTypes.includes(symbol.type) })
			.map(_.clone)
			.value();
	}
	findGroupedByPackage(name, type) {
		return this.find(name, type).reduce((groupedByPackage, bean) => {
      let data = groupedByPackage.find(item => item.package.name == bean.package.name);
    
      if (data) {
        data.beans.push({
          name:          bean.containerBean,
          url:           bean.file
        });

        return groupedByPackage;
      }

      groupedByPackage.push({ 
        package: bean.package, 
        beans: [
          {
            name: bean.containerBean,
            url:  bean.file
          }
        ] 
      });
      
      return groupedByPackage;
    }, []);
	}
	findForQuickPick(name, type) {
		let quickPickData = [];

		this.findGroupedByPackage(name, type).forEach((pkg, index) => {
			quickPickData.push(pkg.package.nameToQuickPick(++index));

			pkg.beans.forEach((bean, beanIndex) => {
				quickPickData.push(`    ${index}.${++beanIndex}. ${bean.name}`);
			});
		});

		return quickPickData;
	}
	rm(absPath) {
		if (absPath in this.tree) delete this.tree[absPath];
	}
	parse(absPath) {
		const relPath = path.relative(this.root, absPath);
		if (this.settings.exclude && minimatch(relPath, this.settings.exclude)) return;
		if (this.settings.include && !minimatch(relPath, this.settings.include)) return;
		return locator(absPath)
			.then(result => {
				this.tree[absPath] = result ? flatten(result, absPath) : [];
			}, err => {
				if (err.code === 'EMFILE') {
					// if there are too many open files
					// try again after somewhere between 0 & 50 milliseconds
					setTimeout(this.parse.bind(this, absPath), Math.random() * 50);
				} else {
					// otherwise, report it
					console.log(err);
					this.rm(absPath);
				}
			});
	}
	walk(root) {
		fs.readdir(root, (err, files) => {
			if (err) return;
			files.forEach(file => {
				const absPath = path.join(root, file);
				const relPath = path.relative(this.root, absPath);
				fs.stat(absPath, (err, stats) => {
					if (err) return;
					if (stats.isDirectory()) {
						if (this.settings.exclude && minimatch(relPath, this.settings.exclude)) return;
						this.walk(absPath);
					} else {
						this.parse(absPath);
					}
				});
			});
		});
	}
};

module.exports = new Locate();