document.addEventListener('DOMContentLoaded', () => {

    // initialization
    let data = treemapdata;
    let width = 954, height = 924;
    let format = d3.format(",d");
    let name = d => d.ancestors().reverse().map(d => d.data.name).join("/")
    
    // these are functions that, when given a value, return an appropriate x and y offset
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

    // mimics DOM.uid from here: https://github.com/observablehq/stdlib/blob/main/src/dom/uid.js
    let leafIds = [];
    let clipIds = [];
    let elseIds = [];
    const DOM = {
        uid: (name) => {
            let newUID = '';
            switch(name){
                case "leaf":
                    newUID = `O-${name}-${leafIds.length + 1}`;
                    leafIds.push(newUID);
                    return newUID;
                case "clipIds":
                    newUID = `O-${name}-${clipIds.length + 1}`;
                    clipIds.push(newUID);
                    return newUID;
                default:
                    newUID = `O-${name}-${elseIds.length + 1}`;
                    elseIds.push(newUID);
                    return newUID;
            }
        }
    };

    const tile = (node, x0, y0, x1, y1) => {
        d3.treemapBinary(node, 0, 0, width, height);
        for (const child of node.children) {
          child.x0 = x0 + child.x0 / width * (x1 - x0);
          child.x1 = x0 + child.x1 / width * (x1 - x0);
          child.y0 = y0 + child.y0 / height * (y1 - y0);
          child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
      };

    const treemap = data => d3.treemap()
        .tile(tile)
    (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value))

    const position = (group, root) => {
        group.selectAll("g")
            .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
          .select("rect")
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
      }

    const zoomin = (d) => {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.append("g").call(render, d);
    
        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);
    
        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
              .call(position, d.parent))
            .call(t => group1.transition(t)
              .attrTween("opacity", () => d3.interpolate(0, 1))
              .call(position, d));
      }

    const zoomout = (d) => {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.insert("g", "*").call(render, d.parent);
    
        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);
    
        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
              .attrTween("opacity", () => d3.interpolate(1, 0))
              .call(position, d))
            .call(t => group1.transition(t)
              .call(position, d.parent));
      }
    
    const render = (group, root) => {
        const node = group
          .selectAll("g")
          .data(root.children.concat(root))
          .join("g");
    
        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));
    
        node.append("title")
            .text(d => `${name(d)}: ${format(d.value)}`);
    
        node.append("rect")
            .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
            .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
            .attr("stroke", "#fff");
    
        node.append("clipPath")
            .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
          .append("use")
            .attr("xlink:href", d => d.leafUid.href);
    
        node.append("text")
            .attr("clip-path", d => d.clipUid)
            .attr("font-weight", d => d === root ? "bold" : null)
          .selectAll("tspan")
          .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
          .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            .text(d => d);
    
        group.call(position, root);
      }
    
    const svg = d3.select("#treemap")
                  .append('svg')
                  .attr('preserveAspectRatio', 'none')
                  .attr("viewBox", [0.5, -30.5, 1 * width, 1 * height + 30])
                  .style("font", "10px sans-serif");
    
    let group = svg.append("g").call(render, treemap(data));
    
});
