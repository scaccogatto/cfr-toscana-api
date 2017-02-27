var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
var fs = require('fs')
var tableToCsv = require('node-table-to-csv')

var readStreams = 0
var streamsNumber = 0

var sourceReader = name => {
  let childArgs = [
    path.join(__dirname, 'data_sources/' + name)
  ]
  
  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    console.log('WRITING: ' + name.split('.')[0])
    if(stdout !== '') {
      fs.writeFile('data_output/' + name.split('.')[0] + '.csv', tableToCsv(stdout), err => {
        if (err) throw err;
        readStreams++
      })
      var date = new Date()
      fs.writeFile('data_output/' + name.split('.')[0] + '/' + date.date + '-' + date.month + '-' + date.year + ' ' + date.hours + '-' + date.minutes + '-' + date.seconds + '.csv', tableToCsv(stdout), err => {
        if (err) throw err;
        readStreams++
      })
    }
    else sourceReader(name)
  })
}

var cycle = () => {
  console.log('/** STARTING SCRIPT **/')
  if(readStreams === streamsNumber) {
    fs.readdir('data_sources', (err, filenames) => {
      streamsNumber = filenames.length
      readStreams = 0
      console.log('/** PLUGINS: ' + filenames + ' **/')
      for(let plugin of filenames) {
        sourceReader(plugin)
      }
    })
  }
}

cycle()

setInterval(cycle, 600000)