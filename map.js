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
                .on("click", function(d) {
                    removeBar()
                    var region = get_region(d)
                    //console.log(region)
                    drawBar(region)
                })
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

    var removeBar = function(){
        var svg = d3.select("#chart")
        svg.selectAll('*').remove();
    }

    var drawBar = async function(region){
        var margin = {top: 20, right: 20, bottom: 85, left: 75},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // add chart to the barchart div
        var svg = d3.select("#chart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom + 5)
                    .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
        
        // get the data
        let data = []
	    await d3.csv('resources/data/usretechnicalpotential_column_aggs.csv', d3.autoType)
        .then(d => {
            data = d
            //console.log(data);
            
            var needed = data.columns.slice(-7);
            var data_filt = data.filter(function(dd){return dd.Region==region});
            console.log(data_filt)
            // get multiple key values
            const subset = (({ all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}) => 
                ({  all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}))(data_filt[0]);
            // transforms object into array
            const data_array = Object.entries(subset).map(([key, value]) => ({
                    key: key,
                    value: value
            }));
            

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

            // text label for the x axis
            svg.append("text")      
            .attr("x", width / 2 )
            .attr("y",  height + margin.bottom)
            .style("text-anchor", "middle")
            .text("Energy Type");

            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(subset))])
            //.domain([0, 160000])
            .range([ height, 0]);
            svg.append("g")
            .call(d3.axisLeft(y));

            // text label for y axis
            svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Potential Generation Capacity (GW)");

            

            // Bars
            svg.selectAll("mybar")
            .data(data_array)
            .enter()
            .append("rect")
                .attr("x", function(d) { return x(d.key); } )
                .attr("y", function(d) { return y(0); } )
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(0); })
                .attr("fill", "yellow")
            ;
            // Animation
            svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .delay(function(d,i){return(i*100)})

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

    function get_region(d) {
        nametext = document.getElementById("tooltip_name");
        return nametext.innerHTML
    }

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
    drawBar("National");
    d3.select('svg')
        .call(zoomf);

  } /* cease "DOMContentLoaded" event */
  );   