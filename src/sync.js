import componentImporter from './component-importer'
import store from 'themekit-docs-store'
import config from 'config'
store.setRef(config.get('storeFirebaseRef'))

const packageName = process.argv[2] || 'themekit-vue'
const packageContent = require(packageName)

import forOwn from 'mout/object/forOwn'
const queue = []
const sync = true

forOwn(packageContent, (data, key) => {
	let component = componentImporter(key, packageContent)
	component.packageId = packageName
	queue.push(store.setComponent(component.name, component, sync))
})

Promise.all(queue).then(function() {
	console.log('saved to firebase: ' + store.getComponentsRef(sync))
	process.exit(1)
})
.catch(function (e) {
	console.log(e)
	process.exit(1)
})