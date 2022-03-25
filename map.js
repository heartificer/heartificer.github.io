document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    var mapdata;
    var width = 650;
    var height = 400;

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

        d3.json("gz_2010_us_040_00_500k.json").then((data) =>{
            mapdata = data;
            console.log(data);
            const paths = svg.selectAll("path").data(data.features);
            paths.enter()
                .append("path")
                .attr("class", n=>n.properties.NAME.replace(/\s/g, n.properties.NAME) + " state")
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
                .on("click", null);
                //.on("click", () => { alert('clementine') });
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

    var drawBar = async function(){
        var margin = {top: 20, right: 20, bottom: 80, left: 60},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // add chart to the barchart div
        var svg = d3.select("#barchart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
        
        // get the data
        let data = []
	    await d3.csv('resources/data/usretechnicalpotential_column_aggs.csv', d3.autoType)
        .then(d => {
            data = d
            console.log(data);
            
            var needed = data.columns.slice(-7);
            var data_filt = data.filter(function(dd){return dd.Region=="National"});
            // get multiple key values
            const subset = (({ all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}) => 
                ({  all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}))(data_filt[0]);
            // transforms object into array
            const data_array = Object.entries(subset).map(([key, value]) => ({
                    key: key,
                    value: value
            }));
            
            /*
            console.log(subset); 
            console.log(data_array); 
            console.log(d3.max(Object.values(subset)))
            
            console.log(data_filt);
            // gets just the values as an array
            console.log(Object.values(data_filt[0]));
            gets just the value associated with the all_PV key
            console.log(data_filt[0]["all_PV"]);
            console.log(data_filt[0].all_PV);
            console.log(data_filt.keys())
            */

            
            /*const iterator = data_filt.values();

            for (const value of iterator) {
            console.log(value);
            }*/

            // X axis
            var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data_array.map(function(d) { return d.key; }))
                //.domain(data.map(function(d) { return d.Region; }))
                //.domain(data_filt.map(function(d) { return d[0]; }))
                //.domain(needed) // gets only the columns starting with 'all'
                .padding(0.2);
            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(subset))])
            //.domain([0, 160000])
            .range([ height, 0]);
            svg.append("g")
            .call(d3.axisLeft(y));

            // Bars
            svg.selectAll("mybar")
            .data(data_array)
            .enter()
            .append("rect")
                .attr("x", function(d) { return x(d.key); } )
                .attr("y", function(d) { return y(d.value); } )
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .attr("fill", "yellow")
            /*.append("rect")
                //.attr("x", function(d) { return x(d.Region); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(Object.values(subset)); })
                .attr("fill", "yellow")
                .attr('fill-opacity', 0.7)
                .attr("height", function(d) { return height - y(0); }) // always equal to 0
                .attr("y", function(d) { return y(0); })
                */
            ;

            /* Animation
            svg.selectAll("rect")
                .transition()
                .duration(1000)
                .attr("y", function(d) { return y(subset); })
                .attr("height", function(d) { return height - y(subset); })
                .delay(function(d,i){console.log(i) ; return(i*100)})
                */
                
            
            console.log(data.Region == "National")
            //console.log(data, d=>d.all_PV);
        })

    }

    function handleZoom(e) {
        d3.select('svg g')
        .attr('transform', e.transform);
        console.log(e.transform);
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