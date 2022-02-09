// dummy example - change text color for paragrphs
d3.selectAll("p").style("color", "red");

// add record count to reflect we have data
let dataNotation = document.createElement("div");
dataNotation.innerHTML = `Our flareData dataset has ${ flareData.length } records`;

let target = document.getElementById("legend");
//target.appendChild(dataNotation);
console.log(flareData);