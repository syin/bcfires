import express from 'express'
import path from 'path'
import * as utils from './utils'
import fire_polygons from '../output_simplified.json'
import fire_convex_hulls from '../output_simplified_padded.json'

const app = express()
const port = process.env.PORT || 8080

const fires = fire_polygons.features

app.use((request, response, next) => {
  next()
})

app.use((err, request, response, next) => {
  console.log(err)
  response.status(500).send('error')
})

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '../map.html'))
})

app.use(express.static('public'))

app.get('/bcmap.geojson', (request, response) => {
  response.sendFile(path.join(__dirname, '../bcmap.geojson'))
})

app.get('/fires/:year', (req, res) => {
  const year = req.params.year
  const firesInYear = utils.filterFiresByYear(year)(fires)
  const firesInYearConvexHulls = utils.filterFiresByYear(year)(fire_convex_hulls)
  res.send([firesInYear, firesInYearConvexHulls])
})

app.listen(port, (err) => {
  if (err) {
    return console.log('error', err)
  }
  console.log('server is listening on ', port)
})
