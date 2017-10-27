/* global d3, $, fetch */

const width = 800
const height = 800
let year = null

const colours = {
  lightGrey: '#cdcdcd',
  darkGrey: '#333333',
  red: 'red'
}

const sliderProps = {
  minYear: 1917,
  maxYear: 2016,
  lineStart: {'x': 50, 'y': 600},
  lineLength: 700
}

const path = d3.geoPath()
    .projection(d3.geoMercator()
    .center([-124.629726, 54.588773])
    .scale(1500))

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

const drawGraph = (json, fill, id) => {
  svg.append('g')
        .attr('id', id)
        .selectAll('path')
        .data(json)
        .enter()
        .append('path')
        .transition()
        .attr('d', path)
        .style('fill', fill)
}

const drawMap = () => {
  d3.json('bcmap.geojson', json => {
    drawGraph([json], colours.lightGrey, 'bcMap')
  })
}

const clearMap = () => {
    d3.selectAll('#firePolygons path')
      .transition()
      .remove()
}

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

const slider = () => {
  const currentYearScaled = (year - sliderProps.minYear) / (sliderProps.maxYear - sliderProps.minYear)

  const slider = svg.append('g')
        .attr('id', 'yearSlider')

  const line = slider.append('line')
        .attr('id', 'yearAxis')
        .attr('x1', sliderProps.lineStart.x)
        .attr('y1', sliderProps.lineStart.y)
        .attr('x2', sliderProps.lineStart.x + sliderProps.lineLength)
        .attr('y2', sliderProps.lineStart.y)
        .attr('stroke-width', 3)
        .attr('stroke', colours.lightGrey)
        .attr('class', 'clickable')
        .on('click', sliderClickHandler)

  const markerInit = {'x': sliderProps.lineStart.x + sliderProps.lineLength * currentYearScaled, 'y': sliderProps.lineStart.y}
  const markerRadius = 10

  const marker = slider.append('circle')
        .attr('id', 'yearMarker')
        .attr('cx', markerInit.x)
        .attr('cy', markerInit.y)
        .attr('r', markerRadius)
        .attr('fill', colours.darkGrey)
        .attr('class', 'draggable')

  const axis = slider.append('g')
  axisFontProperties(axis.append('text')
        .attr('x', sliderProps.lineStart.x)
        .attr('y', sliderProps.lineStart.y + 30)
        .text(sliderProps.minYear))

  axisFontProperties(axis.append('text')
        .attr('x', sliderProps.lineStart.x + sliderProps.lineLength)  // find a way to do the align-right text and prevent overlapping
        .attr('y', sliderProps.lineStart.y + 30)
        .text(sliderProps.maxYear))

  axisFontProperties(axis.append('text')
        .attr('x', sliderProps.lineStart.x + sliderProps.lineLength * currentYearScaled)
        .attr('y', sliderProps.lineStart.y + 30)
        .attr('font-size', '20px')
        .attr('fill', colours.red)
        .text(year))
}

const axisFontProperties = (text) => {
    // idk how to chain this
  text.attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-family', 'sans-serif')
}

const sliderClickHandler = function () {
    // Note: `this` doesn't work with arrow functions
    // clicking along the axis
  const coords = d3.mouse(this)
  console.log('clicked', coords)
  clearMap()
}

const sliderDragHandler = () => {
    // dragging the marker
}

const init = () => {
  year = 2010
  drawMap()
  slider()
  getFiresByYear(year).then(x => drawGraph(x, colours.red, 'firePolygons'))
}

init()
