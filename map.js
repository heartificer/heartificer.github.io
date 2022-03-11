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
    };

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
    d3.select('svg')
        .call(zoomf);
  });
