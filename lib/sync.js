'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _themekitDocsStore = require('themekit-docs-store');

var _themekitDocsStore2 = _interopRequireDefault(_themekitDocsStore);

var _componentImporter = require('./component-importer');

var _componentImporter2 = _interopRequireDefault(_componentImporter);

var _forOwn = require('mout/object/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = (0, _minimist2.default)(process.argv.slice(2), { string: ['package'] });
var queue = [];
var exclude = ['install', 'mixins'];

_themekitDocsStore2.default.setRef(_config2.default.get('storeFirebaseRef'));

function error() {
	console.error.apply(null, [].slice.call(arguments, 0));
	process.exit(1);
}

function log() {
	console.log.apply(null, [].slice.call(arguments, 0));
}

function logAndExit() {
	log.apply(null, [].slice.call(arguments, 0));
	process.exit(1);
}

if (!options.package) {
	error('--package [packageName] is required');
}

var packagePath = options.package;
var packageContent = require(packagePath);
var packageMeta = require(_path2.default.join(packagePath, 'package.json'));

var packageName = packageMeta.name;
var packageDescription = packageMeta.description || null;
var packageVersion = options.version || packageMeta.version || 'latest';

console.log('sync', packageName, packageVersion);

var packageReadmePath = null;
var packageReadme = null;

try {
	packageReadmePath = require.resolve(_path2.default.join(packagePath, 'README.md'));
	packageReadme = _fs2.default.readFileSync(packageReadmePath, 'utf8');
} catch (e) {}

// sync package
// packageDescription = null
// packageReadme = null
_themekitDocsStore2.default.setPackageVersion(packageName, packageVersion, packageDescription, packageReadme)

// sync components
.then(function (packageVersionId) {

	// create queue
	(0, _forOwn2.default)(packageContent, function (packageData, key) {

		// exclude components
		if (exclude.indexOf(key) !== -1) {
			console.warn(key, '[excluded]');
			return true;
		}

		// format component data
		var data = (0, _componentImporter2.default)(key, packageContent);
		var label = data.label;

		var component = { label: label };

		// queue
		queue.push(
		// component
		_themekitDocsStore2.default.setComponentVersion(packageVersionId, data.name, component).then(function (componentVersionId) {
			console.log(key, '[' + componentVersionId + ']');

			// props
			return Promise.all(data.props.map(function (prop) {
				return _themekitDocsStore2.default.setComponentVersionProp(componentVersionId, prop.name, { prop: prop }).then(function (componentVersionPropId) {
					console.log(' ', '[prop]', prop.name, '[' + componentVersionPropId + ']');
				});
			}));
		}));
		return false;
	});

	// run queue
	return Promise.all(queue).then(function () {
		logAndExit('saved components to', _themekitDocsStore2.default.ref.root().toString());
	});
}).catch(function (e) {
	return error(e);
});