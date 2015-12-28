var idArr = ["litPop",
             "gradPop",
             "eduCat"],
    jsonFileName = "js/json/Literate_Population.json",
    xscale, yscale, yAxisScale, vWidth=1100,vHeight=800,padding={left:50,top:50,right:100,bottom:200},svg;

var drawBase = function(index,data) {


/* Created SVG element in respective divisionn */
  svg = d3.select("#" + idArr[index]).append("svg")
    .attr("width",vWidth)
    .attr("height",vHeight);

  var widthOfEachBar=(vWidth-padding.left-padding.right)/data.length-10;
  /* Define x scale based on the data */
  xscale=d3.scale.linear()
    .domain([0,data.length-1])
    .range([0+padding.left,vWidth-padding.right-widthOfEachBar]);

  xAxisScale=d3.scale.linear()
    .domain([0,data.length-1])
    .range([0+padding.left,vWidth-padding.right]);


/* translate all objects with left padding */
  svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + 0 +")")
    .attr("class", "axis")
    .call(d3.svg.axis()
      .scale(yAxisScale)
      .orient("left")
      .tickSize(3,3)
      .ticks(10, "s"));

  var g = svg.append("g");

  g.selectAll("g").data(data)
    .enter().append("g")
    .attr("transform",function(d,i) { return "translate(" + (xscale(i)+2) + "," + (vHeight-padding.bottom+15) +")"; })
    .append("text")
    .attr("x",0)
    .attr("y",0)
    .text(function(d) {
      //console.log(d.label);
      return d.label; })
    .attr("fill","black")
    .attr("transform","rotate(45)");

  g.append("g")
    .append("path")
    .attr("d","m" + xscale(0) + " " + (vHeight-padding.bottom+2) + " L" + (xscale(data.length-1)+80) + " " +(vHeight-padding.bottom+2))
    .attr("stroke","black")
    .attr("stroke-width",3);

  return g;
}

var barChart = function(index,data) {
  //Find min and max value of the data
  var min=d3.min(data,function(d) { return d.population; }),
    max=d3.max(data,function(d) { return d.population; });

  yscale=d3.scale.linear()
    .domain([min,max])
    .range([0,vHeight-padding.bottom-padding.top]);
  yAxisScale=d3.scale.linear()
    .domain([max,min])
    .range([0+padding.top,vHeight-padding.bottom]);

  var widthOfEachBar=(vWidth-padding.left-padding.right)/data.length-20;

  var g = drawBase(index,data);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Population:</strong> <span style='color:red'>" + d.population + "</span>";
    });

  svg.call(tip);
  g.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x",function(d,i) { return xscale(i)+2; })
      .attr("y",function(d) { return vHeight-padding.bottom-yscale(d.population); })
      .attr("width",widthOfEachBar)
      .attr("height",function(d) { return yscale(d.population)} )
      .attr("fill","grey")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
}

var stackedBarChart = function(index,data) {
  //Find min and max value of the data
  var min=d3.min(data,function(d) { return d.population.male + d.population.female; }),
    max=d3.max(data,function(d) { return d.population.male + d.population.female; });

  //console.log(min + " " + max);
  yscale=d3.scale.linear()
    .domain([0,max])
    .range([0,vHeight-padding.bottom-padding.top]);
  yAxisScale=d3.scale.linear()
    .domain([max,min])
    .range([0+padding.top,vHeight-padding.bottom]);

  var widthOfEachBar=600/data.length-10;

  var g = drawBase(index,data);

  var stackedColors = ["rgba(100,160,160,0.9)",
                       "rgba(0,222,255,0.6)"],
      stackChartStartArr = [];

  var tip = [d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,i) {
      return "<strong>Population:</strong> <span style='color:red'>" + d.population.male + "</span>";
    }),d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d,i) {
        return "<strong>Population:</strong> <span style='color:red'>" + d.population.female + "</span>";
      })];

  svg.call(tip[0]);
  svg.call(tip[1]);
  var widthOfEachBar=(vWidth-padding.left-padding.right)/data.length-5;
  var population = ["male","female"];
  for(var i=0;i<2;i++) {
    var group = g.append("g");
    var rect = group.selectAll("rect").data(data)
        .enter().append("rect")
        .attr("x",function(d,j) {
          return xscale(j);
        })
        .attr("width",widthOfEachBar)
        .attr("fill",stackedColors[i])
        .attr("y",function(d,j) {
          if(i==0)
            stackChartStartArr[j]=vHeight-padding.bottom-yscale(d.population[population[i]]);
          else {
            stackChartStartArr[j]-=yscale(d.population[population[i]]);
          }
          //console.log(stackChartStartArr[j]);
          return stackChartStartArr[j];
        })
        .attr("height",function(d) { //console.log(d.label + " " + " " + d.population[population[i]] + " " + yscale(d.population[population[i]]))
          return yscale(d.population[population[i]]) })
        .on('mouseover', tip[i].show)
        .on('mouseout', tip[i].hide);

    var text = g.append("g")
      .attr("transform","translate(" + (vWidth-padding.right) +"," + ((i+10)*20) +")")
    text.append("text")
      .text(population[i])
      .attr("stroke",stackedColors[i]);
    text.append("rect")
      .attr("width",10)
      .attr("height",10)
      .attr("fill",stackedColors[i])
      .attr("transform","translate(-15,-10)");
    }
}

d3.json(jsonFileName, function(err,data) {
  for(var i=0;i<3;i++) {
    switch(i) {
      case 0:
      case 2:
        barChart(i,data[i]);
        break;
      case 1:
        stackedBarChart(i,data[i]);
        break;
    }
  }
});
