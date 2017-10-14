const width = 800;
const height = 800;

const path = d3.geoPath()
    .projection(d3.geoMercator()
        .center([-124.629726, 54.588773])
        .scale(1000));

const svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)

const drawGraph = (json, fill) => {
    svg.selectAll("path")
        .data(json)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", fill)
}

d3.json("bcmap.geojson", json => {
    drawGraph([json], "#cdcdcd")
})

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

getFiresByYear(2014).then(x => drawGraph(x, "red"))
