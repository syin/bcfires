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
    const minYear = 1917
    const maxYear = 2016
    const currentYearScaled = (year - minYear) / (maxYear - minYear)

    const lineStart = {"x": 50, "y": 600}
    const lineLength = 700

    const line = svg.append("line")
        .attr("x1", lineStart.x)
        .attr("y1", lineStart.y)
        .attr("x2", lineStart.x + lineLength)
        .attr("y2", lineStart.y)
        .attr("stroke-width", 3)
        .attr("stroke", colours.lightGrey)


    const markerInit = {"x": lineStart.x + lineLength * currentYearScaled, "y": lineStart.y}
    const markerRadius = 10

    const marker = svg.append("circle")
        .attr("cx", markerInit.x)
        .attr("cy", markerInit.y)
        .attr("r", markerRadius)
        .attr("fill", colours.darkGrey)

    const axis = svg.append("g")
    axisFontProperties(axis.append("text")
        .attr("x", lineStart.x)
        .attr("y", lineStart.y + 30)
        .text(minYear))


    axisFontProperties(axis.append("text")
        .attr("x", lineStart.x + lineLength)  // find a way to do the align-right text and prevent overlapping
        .attr("y", lineStart.y + 30)
        .text(maxYear))

    axisFontProperties(axis.append("text")
        .attr("x", lineStart.x + lineLength * currentYearScaled)
        .attr("y", lineStart.y + 30)
        .attr("font-size", "20px")
        .attr("fill", colours.red)
        .text(year))

}

const axisFontProperties = (text) => {
    // idk how to chain this
    text.attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-family", "sans-serif")
}

const init = () => {
    year = 2010
    drawMap()
    slider()
    getFiresByYear(year).then(x => drawGraph(x, colours.red))
}

init()

