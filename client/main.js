import path from 'path'
import * as utils from './utils'
import jsonfile from './output_simplified.json'

const express = require('express')
const app = express()
const port = 3000

const fires = jsonfile.features

app.use((request, response, next) => {
  next()
})

app.use((err, request, response, next) => {
  console.log(err)
  response.status(500).send('error')
})

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/map.html'))
})

app.use(express.static('public'))

app.get('/output_simplified.json', (request, response) => {
  response.sendFile(path.join(__dirname, '/output_simplified.json'))
})

app.get('/bcmap.geojson', (request, response) => {
  response.sendFile(path.join(__dirname, '/bcmap.geojson'))
})

app.get('/fires/:year', (req, res) => {
  const year = req.params.year
  const firesInYear = utils.filterFiresByYear(year)(fires)
  res.send(firesInYear)
})

app.listen(port, (err) => {
  if (err) {
    return console.log('error', err)
  }
  console.log('server is listening on ', port)
})
