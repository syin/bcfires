/* global d3, $, fetch */

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

const humanizeHa = (input) => {
  if (input >= 10000) {
    return (input / 1000).toFixed(1) + ' kha'
  } else {
    return input + ' ha'
  }
}

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
      .scale(2000))

  const svg = d3.select('#map')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const drawGraph = (json, fill, id) => {
    svg.append('g')
      .attr('id', id)
      .selectAll('path')
      .data(json)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', fill)
      .on('mouseover', function (d) {
        if (d.type === 'Feature') {
          // calculate midpoint of polygon
          const bbox = this.getBBox()
          const cx = bbox.x + bbox.width / 2
          const cy = bbox.y + bbox.height / 2
          const offset = 10
          const finalx = (cx + offset) + 'px'
          const finaly = (cy + offset) + 'px'

          const fireSizeElem = document.getElementById('fire_area')
          fireSizeElem.innerHTML = humanizeHa(d.properties.SIZE_HA)
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
      .remove()

    d3.selectAll('#areaHist g')
      .remove()

    d3.selectAll('#causeBar g')
      .remove()
  }

  const drawMap = () => {
    d3.json('bcmap.geojson', json => {
      drawGraph([json], colours.lightGrey, 'bcMap')
    })
  }

  const aggregateStats = (data) => {
    document.getElementById('fireCount').innerHTML = data.length

    const totalFireArea = Math.round(
      data.reduce((acc, fire) => acc + fire.properties.SIZE_HA, 0))
    document.getElementById('totalFireArea').innerHTML = humanizeHa(totalFireArea)

    const avgFireArea = Math.round(totalFireArea / data.length)
    document.getElementById('avgFireArea').innerHTML = humanizeHa(avgFireArea)

    drawAreaHist(data)
    drawCauseBarChart(data)
  }

  const drawAreaHist = (data) => {
    // Adapted from http://bl.ocks.org/nnattawat/8916402
    // and https://bl.ocks.org/mbostock/3048450
    const margin = {top: 10, right: 30, bottom: 30, left: 30}
    const width = 500
    const height = 300
    const areas = data.map(elem => {
      return elem.properties.SIZE_HA
    })

    console.log('areas', areas)

    const max = d3.max(areas)
    const min = d3.min(areas)
    const x = d3.scaleLinear()
      .domain([min, max])
      .range([0, width])

    const formatCount = d3.format(',.0f')

    const bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(10))(areas)

    const yMax = d3.max(bins, function (d) { return d.length })
    const yMin = d3.min(bins, function (d) { return d.length })
    const colorScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([d3.rgb(colours.red).brighter(), d3.rgb(colours.red).darker()])

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, function (d) { return d.length })])
      .range([height, 0])

    const svgHist = d3.select('#areaHist')
      .attr('viewBox', '0 -10 ' + width + ' ' + (height + 40))
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const g = svgHist.append('g')

    const bar = g.selectAll('.bar')
      .data(bins)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function (d) { return 'translate(' + x(d.x0) + ',' + y(d.length) + ')' })

    bar.append('rect')
      .attr('x', 1)
      .attr('width', x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr('height', function (d) { return height - y(d.length) })
      .attr('fill', function (d) { return colorScale(d.length) })

    bar.append('text')
      .attr('dy', '.75em')
      .attr('y', -10)
      .attr('x', (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr('text-anchor', 'middle')
      .text(function (d) { return formatCount(d.length) })

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x)
              .tickFormat(d3.format('.0s')))
  }

  const drawCauseBarChart = (data) => {
    // Adapted from https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
    const width = 300
    const height = 300

    const causes = data.map(elem => {
      return elem.properties.FIRE_CAUSE
    })

    const cause_dict = causes.reduce((acc, elem) => {
      if (!acc[elem]) {
        acc[elem] = 0
      }
      acc[elem] += 1
      return acc
    }, {})

    const cause_list = Object.keys(cause_dict).reduce((acc, key) => {
      acc.push({'name': key, 'value': cause_dict[key]})
      return acc
    }, [])

    console.log(cause_list)

    const svgBar = d3.select('#causeBar')
      .attr('viewBox', '-50 0 500 ' + height)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, d3.max(cause_list, function (d) {
        return d.value
      })])

    const y = d3.scaleBand()
      .range([height, 0], 0.1)
      .domain(cause_list.map(function (d) {
        return d.name
      }))

    const yAxis = d3.axisLeft(y)
      // no tick marks
      .tickSize(0)

    const gy = svgBar.append('g')
      .attr('class', 'y axis')
      .call(yAxis)

    const bars = svgBar.selectAll('.bar')
      .data(cause_list)
      .enter()
      .append('g')

    // append rects
    bars.append('rect')
      .attr('class', 'bar')
      .attr('y', function (d) {
        return y(d.name)
      })
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', function (d) {
        return x(d.value)
      })

    bars.append('text')
      .attr('class', 'label')
      // y position of the label is halfway down the bar
      .attr('y', function (d) {
        return y(d.name) + y.bandwidth() / 2 + 4
      })
      // x position is 3 pixels to the right of the bar
      .attr('x', function (d) {
        return x(d.value) + 3
      })
      .text(function (d) {
        return d.value
      })
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

    const yearLabel = document.getElementsByClassName('irs-single')[0]
    const position = parseFloat(yearLabel.style.left)

    const format = (inputFloat) => {
      return inputFloat.toString() + '%'
    }

    if (position > rightMargin) {
      yearLabel.style.left = format(rightMargin)
    } else if (position < leftMargin) {
      yearLabel.style.left = format(leftMargin)
    }
  }
}, false)
