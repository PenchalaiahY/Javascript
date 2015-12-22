d3.selectAll("p").style("color", function(d, i) {
  return i % 2 ? "#aaa" : "#ccc";
});


d3.selectAll("p")
    .data([4, 8, 15, 16, 23, 42])
    .style("font-size", function(d) { return d + "px"; });

d3.selectAll("div")
  .data([4, 8, 15, 16, 23, 42])
  .style("font-size",function(d) { return d + "px"; });

var p = d3.select("body").selectAll("p")
    .data([4, 8, 15, 16, 23, 42])
    .text(function(d) { return d; });

// Enter
p.enter().append("p")
    .text(function(d) { return d; });

// Exit
p.exit().remove();
