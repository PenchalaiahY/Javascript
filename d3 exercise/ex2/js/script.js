
var scale=d3.scale.linear()
  .domain([1,5])
  .range([10,90]);

var svg = d3.select("body").append("svg")
  .attr("width",100)
  .attr("height",100);

var rect = svg.selectAll("rect").data([5,2,3,1,4])
              .enter().append("rect")
              .attr("x",function(d,i) { return scale(i+1); })
              .attr("y",function(d) { return (100-scale(d))})
              .attr("height",function(d){ return scale(d); })
              .attr("width",10)
              .attr("fill","green");

var line = svg.selectAll("line").data([1])
  .enter().append("line")
  .attr("x1",0)
  .attr("y1",0)
  .attr("x2",0)
  .attr("y2",100)
  .attr("stroke","green")
  .attr("stroke-width",5);
