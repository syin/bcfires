const width = 500;
const height = 300;

const path = d3.geoPath().projection(d3.geoMercator().center([-124.629726, 54.588773]).scale(200));

const svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

// // d3.json("output_simplified.json", function(json) {
//     svg.selectAll("path")
//         .data(json.features)
//         .enter()
//         .append("path")
//         .attr("d", path);
// });

const drawGraph = fires => {
    svg.selectAll("path")
        .data(fires)
        .enter()
        .append("path")
        .attr("d", path);
}

const getFiresByYear = (year) => fetch('/fires/' + year).then(response => response.json())

getFiresByYear(2014).then(x => drawGraph(x))


// var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
// d3.json(url, function(err, geojson) {
//     svg.append("path")
//         .attr("d", path(geojson))
// })