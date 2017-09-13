const { fork } = require('child_process')
const path = require('path')

const plugins = [
  path.join(__dirname, 'plugins', 'idro.js'),
  path.join(__dirname, 'plugins', 'pluvio-north.js'),
  path.join(__dirname, 'plugins', 'pluvio-south.js')
]

const spawnPlugins = () => {
  plugins.forEach(p => fork(p))
}

spawnPlugins()
setInterval(spawnPlugins, 1 * 60 * 1000)
