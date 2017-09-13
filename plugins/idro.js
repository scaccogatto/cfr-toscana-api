const http = require('http')
const fs = require('fs-extra')
const path = require('path')
const json2csv = require('json2csv')
const log = console.log
const chalk = require('chalk')
const dateFormat = require('dateformat')
const list = ['TOS01004379', 'TOS01004411', 'TOS01004521', 'TOS03004513', 'TOS03004515', 'TOS03004511']

let timestamp = Date.now()
log(chalk.yellow('[' + dateFormat(timestamp, 'dd-mm-yyyy HH-MM-ss')) + ']', chalk.green('[IDRO] Getting data'))

http.get('http://www.cfr.toscana.it/monitoraggio/stazioni.php?type=idro', res => {
  let rawData = ''
  res.on('data', data => { rawData += data })

  res.on('end', () => { store(filterRequired(contextualizeData(rawToArray(cleanRaw(rawData))))) })
})

const cleanRaw = raw => {
  return raw
    .split('var VALUES = new Array();')[1]
    .split('function enphasy(value){')[0]
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
      river: l[1],
      province: l[3],
      alertZone: l[5],
      currentLevel: l[8],
      currentFlow: l[9],
      h1: l[10],
      h3: l[11],
      h6: l[12]
    }))
}

const filterRequired = data => {
  return data.filter(l => list.includes(l.code))
}

const store = data => {
  let timestamp = Date.now()
  let outdir = path.join(__dirname, '..', 'output', dateFormat(timestamp, 'dd-mm-yyyy'), 'idro')

  fs.ensureDir(outdir, () => {
    log(chalk.yellow('[' + dateFormat(timestamp, 'dd-mm-yyyy HH-MM-ss')) + ']', chalk.green('[IDRO] Saving data'))
    fs.writeFile(path.join(__dirname, '..', 'output', dateFormat(timestamp, 'dd-mm-yyyy'), 'idro', dateFormat(timestamp, 'HH-MM-ss') + '.csv'), json2csv({ data }), () => {})
  })
}
