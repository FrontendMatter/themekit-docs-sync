'use strict';

var _componentImporter = require('./component-importer');

var _componentImporter2 = _interopRequireDefault(_componentImporter);

var _themekitDocsStore = require('themekit-docs-store');

var _themekitDocsStore2 = _interopRequireDefault(_themekitDocsStore);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _forOwn = require('mout/object/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_themekitDocsStore2.default.setRef(_config2.default.get('storeFirebaseRef'));

var packageName = process.argv[2] || 'themekit-vue';
var packageContent = require(packageName);

var queue = [];
var sync = true;

(0, _forOwn2.default)(packageContent, function (data, key) {
	var component = (0, _componentImporter2.default)(key, packageContent);
	component.packageId = packageName;
	queue.push(_themekitDocsStore2.default.setComponent(component.name, component, sync));
});

Promise.all(queue).then(function () {
	console.log('saved to firebase: ' + _themekitDocsStore2.default.getComponentsRef(sync));
	process.exit(1);
}).catch(function (e) {
	console.log(e);
	process.exit(1);
});