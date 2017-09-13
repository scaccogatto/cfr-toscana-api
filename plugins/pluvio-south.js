const http = require('http')
const fs = require('fs-extra')
const path = require('path')
const json2csv = require('json2csv')
const log = console.log
const chalk = require('chalk')
const dateFormat = require('dateformat')
const list = ['TOS01000771', 'TOS19000703', 'TOS11000038', 'TOS01000741', 'TOS11000037', 'TOS01000761', 'TOS03000715', 'TOS01000721', 'TOS01000751', 'TOS01000701', 'TOS03000691', 'TOS11000113']

let timestamp = Date.now()
log(chalk.yellow('[' + dateFormat(timestamp, 'dd-mm-yyyy HH-MM-ss')) + ']', chalk.green('[PLUVIO-S] Getting data'))

http.get('http://www.cfr.toscana.it/monitoraggio/stazioni.php?type=pluvio', res => {
  let rawData = ''
  res.on('data', data => { rawData += data })

  res.on('end', () => { store(filterRequired(contextualizeData(rawToArray(cleanRaw(rawData))))) })
})

const cleanRaw = raw => {
  return raw
    .split('var VALUES = new Array();')[1]
    .split('function show(){')[0]
}

const rawToArray = raw => {
  return raw
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(l => l.split('new Array(')[1])
    .map(l => l.replace(');\r', ''))
    .map(l => l.replace(/"/g, ''))
    .map(l => l.split(','))
}

const contextualizeData = rawArray => {
  return rawArray
    .map(l => ({
      code: l[0],
      station: l[2],
      province: l[3],
      alertZone: l[5],
      highness: l[17],
      'h15\'': l[4],
      h1: l[5],
      h3: l[6],
      h6: l[7],
      h12: l[8],
      h24: l[9],
      h36: l[10],
      rh1: l[12],
      rh3: l[13],
      rh6: l[14],
      rh12: l[15],
      rh24: l[16]
    }))
}

const filterRequired = data => {
  return data.filter(l => list.includes(l.code))
}

const store = data => {
  let timestamp = Date.now()
  let outdir = path.join(__dirname, '..', 'output', dateFormat(timestamp, 'dd-mm-yyyy'), 'pluvio-south')

  fs.ensureDir(outdir, () => {
    log(chalk.yellow('[' + dateFormat(timestamp, 'dd-mm-yyyy HH-MM-ss')) + ']', chalk.green('[PLUVIO-S] Saving data'))
    fs.writeFile(path.join(__dirname, '..', 'output', dateFormat(timestamp, 'dd-mm-yyyy'), 'pluvio-south', dateFormat(timestamp, 'HH-MM-ss') + '.csv'), json2csv({ data }), () => {})
  })
}
