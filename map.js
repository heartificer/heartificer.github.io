var width = 1000;
var height = 500;
var selectedState = "National";

document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    var mapdata;

    const pathref = d3.geoPath();
    const projection = d3.geoMercator();
    const pathgen = d3.geoPath().projection(projection);

    // add on-click
    d3.select("#map").on("click", (e) => {
        let isOcean = e.path[0].tagName == 'svg';
        if (isOcean) {
            drawNational();
        }
     });

    function ddClick(e)
    {
        state = e.target.attributes.data.value;
        console.log(state + " dropdown clicked!");
        selectedState = state;
        if (state == "National") {
            drawNational();
        } else {
            drawRegional(selectedState);
        }
        return false;
    }

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
                    var thisState = d.properties.NAME;

                    var zoomOut = selectedState == thisState;
                    
                    selectedState = thisState;
                    
                    const bounds = this.getBBox();
                    const x0 = bounds.x;
                    const x1 = bounds.x + bounds.width;
                    const y0 = bounds.y;
                    const y1 = bounds.y + bounds.height;

                    if(!zoomOut)
                    {
                        var t = "translate(" + (width / 2) + "," + (height / 2) + ") scale(" + (1 / Math.max((x1 - x0) / width, (y1 - y0) / height)) + ") translate(" + (-(x0 + x1) / 2) + "," + (-(y0 + y1) / 2) + ")";
                    }
                    else
                    {
                        var t = "translate(-600,-450) scale(5)";
                        selectedState = "";
                    }

                    g.transition().duration(1000).attr("transform", t);

                    // unhide all 
                    Object.keys(groupMeta).forEach(key => {
                        groupMeta[key].hidden = false;
                    })

                    removeBar();
                    if (!zoomOut){
                        drawRegional(thisState);
                    } else {
                        drawNational();
                    }
                })
            drawNational();
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

    function drawNational(){
        zoomNational();
        removeBar();
        drawBar("National");
        document.getElementById("map").style.display = "block";
        document.getElementById("chart").style.display = "none";
    }

    function drawRegional(region){  
        console.log(region);          
        zoomToState(region);
        removeBar();
        drawBar(region);
        document.getElementById("chart").style.display = "block";
        document.getElementById("map").style.display = "none";
    }
    
    // function zoomFit(paddingPercent, transitionDuration) 
    // {
    //     svg = d3.select("svg");
    //     g = d3.select("svg g");
    //     bb = g.node().getBBox();
    //     widthv = bb.width;
    //     heightv = bb.height;
    //     console.log(g.node().getBBox());
    //     if (widthv && heightv){
    //         //TODO: This is janky. Need a more robust method. -AMH (It's also my fault)
    //         scale = 4;
    //         zoomf.scaleTo(svg, scale);
    //         zoomf.translateTo(svg, widthv * 1.45, heightv * 1.65);
    //     }
    // }

    // let zoomf = d3.zoom().on('zoom', handleZoom);

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
    
    //Zoom Setup
    let zoomf = d3.zoom().on('zoom', handleZoom);
    
    function zoomTo(x,y,k){
        var ctx = d3.zoomIdentity.translate(x, y).scale(k);
        d3.select('svg g').call(zoomf.transform, ctx);
    }
    
    function handleZoom(e) {
            d3.select('svg g')
            .attr('transform', e.transform);
            console.log(e.transform);
    }

    function zoomToState(s){
        st = d3.select("#state_" + s.replace(/\s/g, ''));
        const bounds = st.node().getBBox();
        const x0 = bounds.x;
        const x1 = bounds.x + bounds.width;
        const y0 = bounds.y;
        const y1 = bounds.y + bounds.height;
    
        var t = "translate(" + (width / 2) + "," + (height / 2) + ") scale(" + (1 / Math.max((x1 - x0) / width, (y1 - y0) / height)) + ") translate(" + (-(x0 + x1) / 2) + "," + (-(y0 + y1) / 2) + ")";
        var g = d3.select("svg g");
        g.transition().duration(1000).attr("transform", t);
    }

    function zoomNational(){
        zoomTo(-600, -450, 5);
        selectedState = "";
    }

    var removeBar = function(){
        var svg = d3.select("#chart")
        svg.selectAll('*').remove();
    }

    var drawBar = async function(region, type){
        var margin = {top: 90, right: 20, bottom: 15, left: 75},
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

        // add a title to the bar chart
        svg.append("text")      
            .attr("x", (width / 2) - 130 )
            .attr("y",  -55)
            .attr("font-weight", 700)
            .style("text-anchor", "middle")
            .text(`Potential Generation Capacity (GW)`)
        svg.append("text")      
            .attr("x", (width / 2) - 130 )
            .attr("y",  -35)
            .attr("font-weight", 700)
            .style("text-anchor", "middle")
            .text(`Scope: ${selectedState ? selectedState : "National"} `)

        // add a back arrow
        svg.append("text")
            .attr("x", -60)
            .attr("y", -55)
            .style("cursor","pointer")
            .text("<~~")
            .on("click", () => { drawNational() })
        ;

        /*
        
        tt = document.getElementById("tooltip");
        nametext = document.getElementById("tooltip_name");
        nametext.innerHTML = d.properties["NAME"];
        tt.style.left = e.pageX + "px";
        tt.style.top = e.pageY + "px";
        tt.style.display = "block";
        //*/
        
        // get the data
        let data = []
        await d3.csv('resources/data/usretechnicalpotential_column_aggs.csv', d3.autoType)
        .then(d => {
            data = d
            //console.log(data);
            
            var needed = data.columns.slice(-7);
            let correctedRgion = region == "DistrictofColumbia" ? "District of Columbia" : region;

            var data_filt = data.filter(function(dd){return dd.Region == correctedRgion});

            console.log(data_filt)
            // get multiple key values
            let subset = (({ all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}) => 
                ({  all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}))(data_filt[0]);

            // filter out type, if hidden
            if (type) {
                let groupMetaKeys = Object.keys(groupMeta).filter(g => groupMeta[g].key == type);
                if (groupMetaKeys.length == 1) {
                    let matchingKey = groupMetaKeys[0];
                    groupMeta[matchingKey].hidden = !groupMeta[matchingKey].hidden;

                    let revisedSubset = {};
                    Object.keys(groupMeta).filter(gmKey => !groupMeta[gmKey].hidden && !gmKey.startsWith('unnamed')).forEach(key => {
                        revisedSubset[key] = subset[key];
                    })
                    subset = revisedSubset;
                }
            }

            // filter out data if zero
            if (Object.keys(subset).filter(key => subset[key] == 0).length > 0) {
                let revisedSubset = {};
                Object.keys(groupMeta).forEach(key => {
                    if (subset[key] > 0) {
                        revisedSubset[key] = subset[key];
                    } else {
                        groupMeta[key].include = false;
                    }
                })
                subset = revisedSubset;
            }

            // transforms object into array
            let data_array = Object.entries(subset).map(([key, value]) => ({
                    key: groupMeta[key].key,
                    value: value,
                    color: groupMeta[key].color
            }));

            // sort data_array in order of descending values
            data_array.sort((a,b) => {
                return (a.value >= b.value ? -1 : 1);
            });
    
            // X axis
            var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data_array.map( d => d.key ))
                //.domain(data.map(function(d) { return d.Region; }))
                //.domain(data_filt.map(function(d) { return d[0]; }))
                //.domain(needed) // gets only the columns starting with 'all'
                .padding(0.2);
            svg.append("path")
                .attr("d", d3.line()([[0,height + 0.5],[width,height + 0.5]]))
                .attr("stroke", "black")
                .attr("stroke-width", '1')
                ;
            /*
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
            //*/
    
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
                .attr("y", function(_d) { return y(0); } )
                .attr("width", x.bandwidth())
                .attr("height", _d => height - y(0))
                .attr("fill", x  => x.color ) // return "yellow"
            ;

            // Animation
            svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { 
                if (y(d.value) > 0.975 * height) {
                    return y(d.value) - 3; //height;
                } else {
                    return y(d.value);
                }
            })
            .attr("height", function(d) {
                if (y(d.value) > 0.975 * height) {
                    return 0.01 * height;
                } else {
                    return height - y(d.value);
                }
            })
            .delay(function(_d,i){return(i*100)});

            // Values above bars
            svg.selectAll("mybarvalues")
            .data(data_array)
            .enter()
            .append("text")
                .attr("x", function(d, i) {
                    return x(d.key) + (x.bandwidth()/2) - (d.value.toString().length * 4);
                })
                .attr("y", function(d, i) {
                    if (y(d.value) > 0.975 * height) {
                        return y(d.value) - 7.5;
                    } else {
                        return y(d.value) - 5;
                    }
                })
                .attr("fill", "black" )
                .text(d => d.value)
            ;

            // Legend
            let groups = Object.keys(data_filt[0]).filter(f => f.startsWith("all"));
            // gives group friendly names
            groups = groups
                .map(group => {
                    let match = groupMeta[group];
                    match.include = region == "" || region == "National" ? true : !!subset[group];
                    return match;
                }
            );
            // sort energy types
            groups.sort((a,b) => { return a.key.localeCompare(b.key); });

            // painting
            var legend = svg.append("g")
                .attr("transform", function(_d, i) { return "translate(0," + i * height + ")"; });
            legend.append("rect")
                .attr("width", 230 )
                .attr("height", groups.length * 26 + 42 )
                .attr("x", width - 225 )
                .attr("y",  -78 )
                .attr("fill", 'white')
                .attr("stroke", 'black')
                .attr("stroke-width", '1')
                ;
            legend.append('text')
                .attr("x", width - 205 )
                .attr("y",  -55)
                .attr("font-weight", 500)
                .text("Energy Types");

            svg.selectAll("mybarlegend")
                .data(groups)
                .enter()
                    .append("rect")
                        .attr("width", 207 )
                        .attr("height", 23 )
                        .attr("x", width - 213 )
                        .attr("y", (_x,i) => -45 + 26 * i )
                        .style('fill', x => x.include && !x.hidden ? x.color : 'white')
                        .attr("stroke", 'black')
                        .attr("stroke-width", '1')
                        .on("click", (_event, d) => {
                            removeBar();
                            drawBar(region, d.key);
                        })
            ;
            svg.selectAll("mybarlegend")
                    .data(groups)
                    .enter()
                        .append("text")
                            .attr("x", width - 205 )
                            .attr("y", (_x,i) => -29 + 26 * i )
                            .style('fill', x => x.hidden ? 'black' : 'white')
                            .text((_x,i) => groups[i].key)
                            .on("click", (_event, d) => {
                                removeBar();
                                drawBar(region, d.key);
                            })
                            ;
            //*/
        })
    
    }

    drawMap();
    drawBar("National");
  } /* cease "DOMContentLoaded" event */
);   

var saver;
