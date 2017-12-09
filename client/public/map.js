/* global d3, $, fetch */

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

document.addEventListener('DOMContentLoaded', function () {
  let year = null
  const width = 800
  const height = 700

  const colours = {
    lightGrey: '#cdcdcd',
    darkGrey: '#333333',
    red: 'red'
  }

  const path = d3.geoPath()
    .projection(d3.geoMercator()
      .center([-121.5, 54.588773])
      .scale(2200))

  const svg = d3.select('#graph')
    .attr('id', 'graph')
    .attr('viewBox', "0 0 " + width + " " + height)
    .attr('preserveAspectRatio', "xMidYMid meet")

  const drawGraph = (json, fill, id) => {
    svg.append('g')
      .attr('id', id)
      .selectAll('path')
      .data(json)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', fill)
      .on("mouseover", function(d) {
        if (d.type === "Feature") {
          // calculate midpoint of polygon
          const bbox = this.getBBox()
          const cx = bbox.x + bbox.width / 2
          const cy = bbox.y + bbox.height / 2
          const offset = 10
          const finalx = (cx + offset) + 'px'
          const finaly = (cy + offset) + 'px'

          const fireSizeElem = document.getElementById('fire_area')
          fireSizeElem.innerHTML = d.properties.SIZE_HA + ' ha'
          const fireCauseElem = document.getElementById('fire_cause')
          fireCauseElem.innerHTML = d.properties.FIRE_CAUSE

          d3.select('#tooltip')
            .style('left', finalx)
            .style('top', finaly)
            .classed('hidden', false)
        }
      })
      .on('mouseout', function (d) {
        if (d.type === 'Feature') {
          d3.select('#tooltip').classed('hidden', true)
        }
      })
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

  const aggregateStats = (data) => {
    const totalFireArea = Math.round(
        data.reduce((acc, fire) => acc + fire.properties.SIZE_HA, 0))
    document.getElementById('totalFireArea').innerHTML = totalFireArea
  }

  const render = (data) => {
    drawGraph(data, colours.red, 'firePolygons')
    aggregateStats(data)
  }

  const init = () => {
    year = 2010
    drawMap()
    getFiresByYear(year).then(x => render(x))
  }
  init()

  $('#slider').ionRangeSlider({
    min: 1917,
    max: 2016,
    from: 2010,
    step: 1,
    prettify_enabled: false,
    onFinish: function (data) {
      clearMap()
      getFiresByYear(data.from).then(x => render(x))
    }
  })
}, false)
