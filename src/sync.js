import path from 'path'
import minimist from 'minimist'
import config from 'config'
import store from 'themekit-docs-store'
import componentImporter from './component-importer'
import forOwn from 'mout/object/forOwn'
import fs from 'fs'

const options = minimist(process.argv.slice(2), { string: ['package'] })
const queue = []
const exclude = ['install', 'mixins']

store.setRef(config.get('storeFirebaseRef'))

function error () {
	console.error.apply(null, [].slice.call(arguments, 0))
	process.exit(1)
}

function log () {
	console.log.apply(null, [].slice.call(arguments, 0))
}

function logAndExit () {
	log.apply(null, [].slice.call(arguments, 0))
	process.exit(1)
}

if (!options.package) {
	error('--package [packageName] is required')
}

const packagePath = options.package
const packageContent = require(packagePath)
const packageMeta = require(path.join(packagePath, 'package.json'))

const packageName = packageMeta.name
let packageDescription = packageMeta.description || null
const packageVersion = options.version || (packageMeta.version || 'latest')

console.log('sync', packageName, packageVersion)

let packageReadmePath = null
let packageReadme = null

try {
	packageReadmePath = require.resolve(path.join(packagePath, 'README.md'))
	packageReadme = fs.readFileSync(packageReadmePath, 'utf8')
}
catch (e) {}

// sync package
// packageDescription = null
// packageReadme = null
store.setPackageVersion(packageName, packageVersion, packageDescription, packageReadme)

// sync components
.then((packageVersionId) => {

	// create queue
	forOwn(packageContent, (packageData, key) => {

		// exclude components
		if (exclude.indexOf(key) !== -1) {
			console.warn(key, '[excluded]')
			return true
		}
		
		// format component data
		const data = componentImporter(key, packageContent)
		const { label } = data
		const component = { label }

		// queue
		queue.push(
			// component
			store.setComponentVersion(packageVersionId, data.name, component).then((componentVersionId) => {
				console.log(key, `[${ componentVersionId }]`)

				// props
				return Promise.all(
					data.props.map((prop) => {
						return store.setComponentVersionProp(componentVersionId, prop.name, { prop }).then((componentVersionPropId) => {
							console.log(' ', '[prop]', prop.name, `[${ componentVersionPropId }]`)
						})
					})
				)
			})
		)
		return false
	})

	// run queue
	return Promise.all(queue).then(() => {
		logAndExit('saved components to', store.ref.root().toString())
	})
})
.catch ((e) => error(e))