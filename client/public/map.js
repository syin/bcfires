/* global d3, $, fetch */

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

document.addEventListener('DOMContentLoaded', function () {
  
  const width = 800
  const height = 800
  let year = null

  const colours = {
    lightGrey: '#cdcdcd',
    darkGrey: '#333333',
    red: 'red'
  }

  const path = d3.geoPath()
    .projection(d3.geoMercator()
      .center([-124.629726, 54.588773])
      .scale(1500))

  const svg = d3.select('#graph')
    .attr('id', 'graph')
    .attr('width', width)
    .attr('height', height)

  const drawGraph = (json, fill, id) => {
    svg.append('g')
      .attr('id', id)
      .selectAll('path')
      .data(json)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', fill)
  }

  const clearMap = () => {
    d3.selectAll('#firePolygons path')
      .transition()
      .remove()
  }

  const drawMap = () => {
    d3.json('bcmap.geojson', json => {
      drawGraph([json], colours.lightGrey, 'bcMap')
    })
  }

  const init = () => {
    year = 2010
    drawMap()
    getFiresByYear(year).then(x => drawGraph(x, colours.red, 'firePolygons'))
  }
  init()

  $('#slider').ionRangeSlider({
    min: 1917,
    max: 2016,
    step: 1,
    onFinish: function (data) {
      clearMap()
      getFiresByYear(data.from).then(x => drawGraph(x, colours.red, 'firePolygons'))
    }
  })
}, false)
