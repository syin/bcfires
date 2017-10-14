const width = 800;
const height = 800;
let year = null;

const colours = {
    lightGrey: "#cdcdcd",
    darkGrey: "#333333",
    red: "red",

}

const path = d3.geoPath()
    .projection(d3.geoMercator()
    .center([-124.629726, 54.588773])
    .scale(1500))

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

const drawMap = () => {
    d3.json("bcmap.geojson", json => {
        drawGraph([json], colours.lightGrey)
    })
}

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

const slider = () => {
    const lineStart = {"x": 50, "y": 600}
    const lineLength = 700

    const line = svg.append("line")
        .attr("x1", lineStart.x)
        .attr("y1", lineStart.y)
        .attr("x2", lineStart.x + lineLength)
        .attr("y2", lineStart.y)
        .attr("stroke-width", 3)
        .attr("stroke", colours.lightGrey)


    const markerInit = {"x": 700, "y": lineStart.y}
    const markerRadius = 10

    const marker = svg.append("circle")
        .attr("cx", markerInit.x)
        .attr("cy", markerInit.y)
        .attr("r", markerRadius)
        .attr("fill", colours.darkGrey)
}

const init = () => {
    year = 2010
    drawMap()
    slider()
    getFiresByYear(year).then(x => drawGraph(x, colours.red))
}

init()

