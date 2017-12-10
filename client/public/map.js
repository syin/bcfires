/* global d3, $, fetch */

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

document.addEventListener('DOMContentLoaded', function () {
  let year = null
  const width = 800
  const height = 700

  const colours = {
    lightGrey: '#cdcdcd',
    darkGrey: '#333333',
    red: '#ed5565'
  }

  const path = d3.geoPath()
    .projection(d3.geoMercator()
      .center([-121.5, 54.588773])
      .scale(2200))

  const svg = d3.select('#map')
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

    const avgFireArea = Math.round(totalFireArea / data.length)
    document.getElementById('avgFireArea').innerHTML = avgFireArea

    drawAreaHist(data)
    drawCauseBarChart(data)
  }

  const drawAreaHist = (data) => {
    // Adapted from http://bl.ocks.org/nnattawat/8916402
    // and https://bl.ocks.org/mbostock/3048450

    var color = colours.red;
    const width = 500
    const height = 300
    const areas = data.map(elem => {
      return elem.properties.SIZE_HA
    })

    const max = d3.max(areas)
    const min = d3.min(areas)
    const x = d3.scaleLinear()
      .domain([min, max])
      .range([0, width]);

    const formatCount = d3.format(",.0f");

    const bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20))
      (areas)

    const yMax = d3.max(bins, function(d){return d.length});
    const yMin = d3.min(bins, function(d){return d.length});
    const colorScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([height, 0]);

    const svgHist = d3.select('#areaHist')
      .attr('viewBox', "0 0 " + width + " " + (height + 40))
      .attr('preserveAspectRatio', "xMidYMid meet")

    const g = svgHist.append("g")

    const bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")" });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y(d.length) })
        .attr("fill", function(d) { return colorScale(d.length) })

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length) })

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

  }

  drawCauseBarChart = (data) => {

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
      adjustLabelMargin()
    }
  })

  const adjustLabelMargin = () => {
    // Adjust position of year label so that it doesn't get cut off
    const leftMargin = 0.0530483
    const rightMargin = 88.3731

    const yearLabel = document.getElementsByClassName("irs-single")[0]
    const position = parseFloat(yearLabel.style.left)

    const format = (inputFloat) => {
      return inputFloat.toString() + "%"
    }

    if (position > rightMargin) {
      yearLabel.style.left = format(rightMargin)
    } else if (position < leftMargin) {
      yearLabel.style.left = format(leftMargin)
    }
  }
}, false)
