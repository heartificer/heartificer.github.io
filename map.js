document.addEventListener("DOMContentLoaded", function(event) { 

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

        var svg = d3.select("#chart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
        
        // get the data
        let data = []
	    await d3.csv('resources/data/usretechnicalpotential_column_aggs.csv').then(d => {
            data = d // just get the last row

            // X axis
            var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(function(d) { return d.Region; }))
                //.domain(["all_PV", "all_Wind", "all_CSP", "all_biopower",
                        //"all_Hydrothermal", "all_Geothermal", "all_hydropower"])
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
                .attr("x", function(d) { return x(d.Region); })
                //.attr("x", ["all_PV", "all_Wind", "all_CSP", "all_biopower",
                        //"all_Hydrothermal", "all_Geothermal", "all_hydropower"])
                .attr("y", function(d) { return y(d.all_PV); })
                //.attr("y", [d.all_PV, d.all_Wind, d.all_CSP, d.all_biopower,
                           // d.all_Hydrothermal, d.all_Geothermal, d.all_hyfropower])
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.all_PV); })
                .attr("fill", "yellow")
                .attr('fill-opacity', 0.7)
            ;
                
            
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

    drawMap();
    drawBar();
    d3.select('svg')
        .call(zoomf);
  });
