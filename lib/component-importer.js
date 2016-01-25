'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _properCase = require('mout/string/properCase');

var _properCase2 = _interopRequireDefault(_properCase);

var _pascalCase = require('mout/string/pascalCase');

var _pascalCase2 = _interopRequireDefault(_pascalCase);

var _forOwn = require('mout/object/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _merge = require('mout/object/merge');

var _merge2 = _interopRequireDefault(_merge);

var _hyphenate = require('mout/string/hyphenate');

var _hyphenate2 = _interopRequireDefault(_hyphenate);

var _unhyphenate = require('mout/string/unhyphenate');

var _unhyphenate2 = _interopRequireDefault(_unhyphenate);

var _slugify = require('mout/string/slugify');

var _slugify2 = _interopRequireDefault(_slugify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function funcToString(data) {
	if (typeof data === 'function') {
		return data.toString();
	}
	return data;
}

function slug(value) {
	return (0, _slugify2.default)(value.replace(/\./g, ' '));
}

exports.default = function (id, data) {
	id = (0, _hyphenate2.default)(id);
	var label = (0, _properCase2.default)((0, _unhyphenate2.default)(id));
	var propertyName = (0, _pascalCase2.default)(id);
	var component = Object.assign({}, data[propertyName]);
	var input = {};

	var extract = ['created', 'beforeCompile', 'compiled', 'ready', 'beforeDestroy', 'destroyed', 'data', 'computed', 'methods', 'watch', 'mixins', 'props', 'events', 'components'];

	var toStrings = ['created', 'beforeCompile', 'compiled', 'ready', 'beforeDestroy', 'destroyed', 'data'];

	var toStringFor = ['computed', 'methods', 'watch'];

	extract.forEach(function (property) {
		if (component[property]) {
			var obj = {};
			obj[property] = component[property];
			input = Object.assign({}, input, obj);
		}
	});

	toStrings.forEach(function (stringify) {
		if (input[stringify]) {
			input[stringify] = funcToString(input[stringify]);
		}
	});

	toStringFor.forEach(function (property) {
		if (input[property]) {
			(0, _forOwn2.default)(input[property], function (value, name, obj) {
				obj[name] = funcToString(value);
			});
		}
	});

	if (input.mixins) {
		input.mixins = input.mixins.filter(function (mix) {
			return typeof mix.name !== 'undefined';
		}).map(function (mix) {
			return {
				name: mix.name,
				label: (0, _properCase2.default)((0, _unhyphenate2.default)(mix.name))
			};
		});
	}

	(0, _forOwn2.default)(input.props, function (prop, name, obj) {
		obj[name] = {
			name: (0, _hyphenate2.default)(name),
			description: prop.description || null,
			type: prop.type ? prop.type.name : null,
			default: funcToString(prop.default) || null,
			required: prop.required || null
		};
	});

	(0, _forOwn2.default)(input.events, function (event, name, obj) {
		obj[slug(name)] = {
			name: name,
			event: event.toString()
		};
		delete obj[name];
	});

	if (input.components) {
		(function () {
			var components = [];
			(0, _forOwn2.default)(input.components, function (component, name) {
				var id = (0, _hyphenate2.default)(name);
				components.push({
					id: id,
					label: (0, _properCase2.default)((0, _unhyphenate2.default)(id))
				});
			});
			input.components = components;
		})();
	}

	return (0, _merge2.default)(input, {
		name: id,
		label: label
	});
};

module.exports = exports.default;