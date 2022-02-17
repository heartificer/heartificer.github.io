var mapdata;
var width = 900;
var height = 500;

const projection = d3.geoMercator();
const pathgen = d3.geoPath().projection(projection);

var drawMap = function(){
    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g");

    d3.json("gz_2010_us_040_00_500k.json").then((data) =>{
        mapdata = data;
        console.log(data);
        const paths = svg.selectAll("path").data(data.features);
        console.log(paths);
        paths.enter().append("path").attr("class", n=>n.properties.NAME.replace(/\s/g, n.properties.NAME)).attr("d",d => pathgen(d));
    });
};

document.addEventListener("DOMContentLoaded", function(event) { 
    drawMap();
    d3.select('svg')
        .call(zoom);
  });

function handleZoom(e) {
    d3.select('svg g')
    .attr('transform', e.transform);
}

let zoom = d3.zoom().on('zoom', handleZoom);
