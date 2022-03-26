document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    var mapdata;
    var width = 650;
    var height = 400;

    const pathref = d3.geoPath();
    const projection = d3.geoMercator();
    const pathgen = d3.geoPath().projection(projection);

    // add on-click
    d3.select("#map").on("click", (e) => {
        let isOcean = e.path[0].tagName == 'svg';
        if (isOcean) {
            // insert un-zoom code
        }
     });


    var drawMap = function(){
        var svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g");

        d3.json("resources/data/gz_2010_us_040_00_500k.json").then((data) =>{
            mapdata = data;
            var stateNames = []
            for(var i = 0; i < data.features.length; i++){
                if(data.features[i].properties["NAME"] != "Alaska" && data.features[i].properties["NAME"] != "Hawaii" )//Remove to Contiguous 48
                stateNames.push(data.features[i].properties["NAME"]);
            }
            stateNames = stateNames.sort();
            stateSelectDD = document.getElementById("stateSelector");
            for(var i = 0; i < stateNames.length; i++)
            {
                var ddid = "dropdown_" + stateNames[i].replace(/\s/g, '');
                stateSelectDD.innerHTML += "<li><a id='" + ddid + "' class='dropdown-item' href='#' data='" + stateNames[i].replace(/\s/g, '') + "'>" + stateNames[i] + "</a></li>";
                var delem = document.getElementById(ddid);
            }
            var dds = document.getElementsByClassName('dropdown-item');
            for(i = 0; i < dds.length; i++)
            {
                dds[i].addEventListener('click', (e) => ddClick(e));
            }
            const paths = svg.selectAll("path").data(data.features);
            paths.enter()
                .append("path")
                .attr("id", n=>"state_" + n.properties.NAME.replace(/\s/g, ''))
                .attr("class", n=>n.properties.NAME.replace(/\s/g, '') + " state")
                .attr("d",d => pathgen(d))

                // state border coloring
                .attr("fill", "black")
                .attr("stroke-width", "0.0625")
                .attr("stroke", "black")
                
                .on("mousemove", function(e, d) {
                    d3.select(this).style("fill", "yellow")
                        .attr('fill-opacity', 0.3);
                        tooltip_wake(e, d);
                  })
                .on("mouseleave", function(d) {
                    d3.select(this).style("fill", "grey")
                        .attr('fill-opacity', 1);
                        tooltip_sleep();
                })
                .on("click", function(event, d) {
                    g = d3.select('svg g');
                    d.clicked = !d.clicked;
                    const bounds = this.getBBox();
                    const x0 = bounds.x;
                    const x1 = bounds.x + bounds.width;
                    const y0 = bounds.y;
                    const y1 = bounds.y + bounds.height;
                    g.transition().duration(1000).attr("transform", d.clicked ? "translate(" + (width / 2) + "," + (height / 2) + ") scale(" + (1 / Math.max((x1 - x0) / width, (y1 - y0) / height)) + ") translate(" + (-(x0 + x1) / 2) + "," + (-(y0 + y1) / 2) + ")" : "transform(0,0) scale(1)");
                });

            zoomFit(0, 0);
        });
/*
        d3.csv('resources/data/usretechnicalpotential_national.csv').then(data => {
            energydata = data
            console.log(data)
            const paths = svg.selectAll("path").data(data);
            paths.enter()

                .on("click", function(d) {
                    
                })
                
                
        })*/
    };

    function clickState(e)
    {
        console.log("TEST");
    }

    var drawBar = async function(){
        var margin = {top: 20, right: 20, bottom: 80, left: 60},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#chart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
        
        // get the data
        let data = []
	    await d3.csv('resources/data/usretechnicalpotential_national_column_aggs.csv').then(d => {
            data = d // just get the last row

            // X axis
            var x = d3.scaleBand()
                .range([ 0, width ])
                //.domain(data.map(function(d) { return d.Region; }))
                //.domain(data.map(function(d) { return data.columns; }))
                .domain(["all_PV", "all_Wind", "all_CSP", "all_biopower",
                        "all_Hydrothermal", "all_Geothermal", "all_hydropower"])
                .padding(0.2);
            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => Number(d.all_PV))])
            //.domain([0, 160000])
            .range([ height, 0]);
            svg.append("g")
            .call(d3.axisLeft(y));

            // Bars
            svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
                //.attr("x", function(d) { return x(d.Region); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .attr("fill", "yellow")
                .attr('fill-opacity', 0.7)
                .attr("height", function(d) { return height - y(0); }) // always equal to 0
                .attr("y", function(d) { return y(0); })
            ;

            // Animation
            svg.selectAll("rect")
                .transition()
                .duration(1000)
                .attr("y", function(d) { return y(d.all_PV); })
                .attr("height", function(d) { return height - y(d.all_PV); })
                .delay(function(d,i){console.log(i) ; return(i*100)})
                
            
            console.log(data.Region == "National")
            //console.log(data, d=>d.all_PV);
        })

    }

    function handleZoom(e) {
        d3.select('svg g')
        .attr('transform', e.transform);
    }
    
    function zoomFit(paddingPercent, transitionDuration) 
    {
        svg = d3.select("svg");
        g = d3.select("svg g");
        bb = g.node().getBBox();
        widthv = bb.width;
        heightv = bb.height;
        console.log(g.node().getBBox());
        if (widthv && heightv){
            //TODO: This is janky. Need a more robust method. -AMH (It's also my fault)
            scale = 4;
            zoomf.scaleTo(svg, scale);
            zoomf.translateTo(svg, widthv * 1.45, heightv * 1.65);
        }
    }

    let zoomf = d3.zoom().on('zoom', handleZoom);

    function tooltip_wake(e, d)
    {
        tt = document.getElementById("tooltip");
        nametext = document.getElementById("tooltip_name");
        nametext.innerHTML = d.properties["NAME"];
        tt.style.left = e.pageX + "px";
        tt.style.top = e.pageY + "px";
        tt.style.display = "block";
    }

    function tooltip_sleep()
    {
        tt = document.getElementById("tooltip");
        tt.style.display = "none";
    }

    function getMeatspacePosition() {
        const statusDetails = document.querySelector("#statusDetails");
        const locationDetails = document.querySelector("#locationDetails");
        locationDetails.href = '';
        locationDetails.textContent = '';
        if (!navigator.geolocation) {
            statusDetails.textContent = 'Geolocation is not supported by your browser';
        } else {
            statusDetails.textContent = 'Locating …';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // success method
                    const latitude  = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    statusDetails.textContent = '';
                    locationDetails.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
                    locationDetails.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
                },
                () => {
                    // error / failure method
                    statusDetails.textContent = 'Unable to retrieve your location';
                }
            );
        }
    }

    if (getMeatspacePosition && document.querySelector("#fetchLocation")){
        document.querySelector("#fetchLocation").addEventListener('click', getMeatspacePosition);
    }

    drawMap();
    drawBar();
    d3.select('svg')
        .call(zoomf);
   
  } /* cease "DOMContentLoaded" event */
);   

var saver;

function ddClick(e)
{
    state = e.target.attributes.data.value;
    console.log(state + " dropdown clicked!");
    return false;
}
