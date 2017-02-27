var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
var fs = require('fs')
var mkdirp = require('mkdirp')
var tableToCsv = require('node-table-to-csv')

var stardedScript = false
var running = false

var sourceReader = name => {
  running = true
  let childArgs = [
    path.join(__dirname, 'data_sources/' + name)
  ]
  
  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    console.log('WRITING: ' + name.split('.')[0])
    if(stdout !== '') {
      fs.writeFile('data_output/' + name.split('.')[0] + '.csv', tableToCsv(stdout), err => {
        if (err) throw err;
      })
      var date = new Date()
      mkdirp('data_output/' + name.split('.')[0])
      fs.writeFile('data_output/' + name.split('.')[0] + '/' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + ' ' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '.csv', tableToCsv(stdout), err => {
        if (err) throw err;
      })
    }
    else {
      console.log('! ERROR ! - Is the website unavailable? I will retry later')
    }
    running = false
  })
}

var waitForRun = plugin => {
  setTimeout(() => {
    if (!running) {
      sourceReader(plugin)
    } else {
      waitForRun(plugin)
    }
  }, 2500)
}

var cycle = () => {
  console.log('/** STARTING SCRIPT **/')
  fs.readdir('data_sources', (err, filenames) => {
    console.log('/** PLUGINS: ' + filenames + ' **/')
    for(let plugin of filenames) {
      waitForRun(plugin)
    }
  })
}

cycle()

setInterval(cycle, 600000)