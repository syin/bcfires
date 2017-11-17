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
      .attr("x", 500)
      .attr("y", 500)
      .on("mouseover", function(d) {
        if (d.type === "Feature") {
          console.log(d.properties.SIZE_HA)
          svg.append("text")
            .attr("id", "tooltip")
            .attr("x", d3.select(this).attr("x"))
            .attr("y", d3.select(this).attr("y"))
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Area: " + d.properties.SIZE_HA);
        }
      })
      .on("mouseout", function(d) {
        if (d.type === "Feature") {
          d3.select("#tooltip").remove();
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
      console.log(data)
      const totalFireArea = Math.round(
        data.reduce((acc, fire) => {
          return acc + fire.properties.SIZE_HA
        }, 0))
      document.getElementById("totalFireArea").innerHTML = totalFireArea
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
    step: 1,
    onFinish: function (data) {
      clearMap()
      getFiresByYear(data.from).then(x => render(x))
    }
  })
}, false)

