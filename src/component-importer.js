import properCase from 'mout/string/properCase'
import pascalCase from 'mout/string/pascalCase'
import forOwn from 'mout/object/forOwn'
import merge from 'mout/object/merge'
import hyphenate from 'mout/string/hyphenate'
import unhyphenate from 'mout/string/unhyphenate'
import slugify from 'mout/string/slugify'

function funcToString (data) {
	if (typeof data === 'function') {
		return data.toString()
	}
	return data
}

function slug (value) {
	return slugify(value.replace(/\./g, ' '))
}

export default (id, data) => {
	id = hyphenate(id)
	let label = properCase(unhyphenate(id))
	let propertyName = pascalCase(id)
	let component = Object.assign({}, data[propertyName])
	let input = {}

	const extract = [
		'created', 
		'beforeCompile', 
		'compiled', 
		'ready', 
		'beforeDestroy', 
		'destroyed', 
		'data',
		'computed',
		'methods',
		'watch',
		'mixins',
		'props',
		'events',
		'components'
	]

	let toStrings = [
		'created', 
		'beforeCompile', 
		'compiled', 
		'ready', 
		'beforeDestroy', 
		'destroyed', 
		'data'
	]

	let toStringFor = [
		'computed',
		'methods',
		'watch'
	]

	extract.forEach((property) => {
		if (component[property]) {
			let obj = {}
			obj[property] = component[property]
			input = Object.assign({}, input, obj)
		}
	})

	toStrings.forEach((stringify) => {
		if (input[stringify]) {
			input[stringify] = funcToString(input[stringify])
		}
	})

	toStringFor.forEach((property) => {
		if (input[property]) {
			forOwn(input[property], (value, name, obj) => {
				obj[name] = funcToString(value)
			})
		}
	})

	if (input.mixins) {
		input.mixins = input.mixins.filter((mix) => {
			return typeof mix.name !== 'undefined'
		})
		.map((mix) => {
			return { 
				name: mix.name,
				label: properCase(unhyphenate(mix.name))
			}
		})
	}

	forOwn(input.props, (prop, name, obj) => {
		obj[name] = {
			name: hyphenate(name),
			description: prop.description || null,
			type: prop.type ? prop.type.name : null,
			default: funcToString(prop.default) || null,
			required: prop.required || null
		}
	})

	forOwn(input.events, (event, name, obj) => {
		obj[slug(name)] = {
			name: name,
			event: event.toString()
		}
		delete obj[name]
	})

	if (input.components) {
		let components = []
		forOwn(input.components, (component, name) => {
			let id = hyphenate(name)
			components.push({
				id: id,
				label: properCase(unhyphenate(id))
			})
		})
		input.components = components
	}

	return merge(input, {
		name: id,
		label: label
	})
}

module.exports = exports.default