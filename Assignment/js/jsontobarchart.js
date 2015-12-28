
var tabsIDs = ["fgProd13","osProd13","ccaProdyear","scfs"], // getting tabsIDs
    jsonFileNames = ["js/json/FoodGrain13Prod.json",
                      "js/json/OilSeed13Prod.json",
                      "js/json/CommercialCropVsYears.json",
                      "js/json/FourStateRiceProdVsYears.json"], // Json file Names
    xscale,yscale,yAxisScale,width,height=700,svg,
    padding = { left:50, right:200, bottom:200, top:50};
$('[data-toggle="tooltip"]').tooltip();

var drawBase = function(index,data) {
  width = data.length*30 + padding.left + padding.right;

  var xAxisScale=d3.scale.linear()
     .domain([0,data.length-1])
    .range([0+padding.left,width-padding.right]);

  xscale=d3.scale.linear()
    .domain([0,data.length-1])
    .range([0+padding.left,width-padding.right]);
  svg = d3.select("#" + tabsIDs[index]).append("svg")
    .attr("width",width)
    .attr("height",height);

  svg.append("g")
    .attr("transform", "translate(" + 50 + ",0)")
    .attr("class", "axis")
    .call(d3.svg.axis()
      .scale(yAxisScale)
      .orient("left")
      .tickSize(3,3)
      .ticks(20, "s"));
  svg.append("g")
    .attr("transform", "translate(" + xAxisScale(0) + "," + (height-padding.bottom+2) + ")") // 451 is for pushing line below barchart
    .append("path")
    .attr("d","m0 0 L" + xAxisScale(data.length-1) + " 0")
    .attr("stroke","black")
    .attr("stroke-width",3);

  var g = svg.append("g")
      .attr("transform", "translate(10,0)");

  for(var i=0;i<=data.length-1;i++) {
    g.append("g")
      .attr("transform","translate(" + (xscale(i)+2) + "," + (height-padding.bottom+10) + ")")
      .append("text")
      .attr("x",0)
      .attr("y",0)
      .text(data[i].grainName)
      .attr("fill","black")
      .attr("transform","rotate(45)");
  }

  return g;
};

var drawBarChart = function(g,data) {
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Production:</strong> <span style='color:red'>" + d.prodYear2013 + "</span>";
    });

  svg.call(tip);
  g.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x",function(d,i) { return xscale(i); })
      .attr("y",function(d) { return height-padding.bottom-yscale(Math.ceil(d.prodYear2013)); })
      .attr("width",20)
      .attr("height",function(d) { return yscale(Math.ceil(d.prodYear2013))} )
      .attr("fill","grey")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
}

var drawStackedChart = function(g,data) {
  var stackedColors = ["rgba(160,160,160,0.9)",
                       "rgba(0,0,255,0.6)",
                       "rgba(255,0,0,0.6)",
                       "rgba(0,255,0,0.6)"],
      stackChartStartArr = [];

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Production:</strong> <span style='color:red'>" + d.value + "</span>";
    });

  svg.call(tip);

  for(var i=0;i<data.length;i++) {
    var group = g.append("g");
    var rect = group.selectAll("rect").data(data[i].Data)
        .enter().append("rect")
        .attr("x",function(d,j) {
          return xscale(j);
        })
        .attr("width",20)
        .attr("fill",stackedColors[i])
        .attr("y",function(d,j) {
          if(i==0)
            stackChartStartArr[j]=vHeight-padding.bottom-yscale(Math.ceil(d.value));
          else {
            stackChartStartArr[j]-=yscale(Math.ceil(d.value));
          }
          return stackChartStartArr[j];
        })
        .attr("height",function(d) { return yscale(Math.ceil(d.value)); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var text = g.append("g")
      .attr("transform","translate(" + (width-padding.right+80) +"," + ((i+10)*20) +")")
    text.append("text")
      .text(data[i].state)
      .attr("stroke",stackedColors[i]);
    text.append("rect")
      .attr("width",10)
      .attr("height",10)
      .attr("fill",stackedColors[i])
      .attr("transform","translate(-15,-10)");
  }
};

var process2013Prod = function(index,data) {
  //Sorting objects using array.sort
  data.sort(function(a,b) {
    return parseFloat(b.prodYear2013) - parseFloat(a.prodYear2013);
  });
  yAxisScale=d3.scale.linear()
        .domain([data[0].prodYear2013,data[data.length-1].prodYear2013])
        .range([0+padding.top,height-padding.bottom]),
  yscale=d3.scale.linear()
    .domain([data[data.length-1].prodYear2013,data[0].prodYear2013])
    .range([0,height-padding.bottom-padding.top]);
  var g = drawBase(index,data);
  drawBarChart(g,data);
};

var processCCAggregate = function(data) {
  var extratedData = [];
  for(var i=0,len=data.aggregateValue.length;i<len;i++){
    extratedData[i] = { grainName : data.aggregateValue[i].year,
      prodYear2013 : data.aggregateValue[i].value};
  }
  var min = d3.min(extratedData,function(d) { return d.prodYear2013; }),
    max = d3.max(extratedData,function(d) { return d.prodYear2013; });
  yAxisScale=d3.scale.linear()
        .domain([max,min])
        .range([0+padding.top,height-padding.bottom]),
  yscale=d3.scale.linear()
    .domain([min,max])
    .range([0,height-padding.bottom-padding.top]);

  var g = drawBase(2,extratedData);
  drawBarChart(g,extratedData);
};

//processFourStateRiceProd
var processFourStateRiceProd = function(data){
  var extratedYearDataforMinMax = [],min,max;
  for(var i=0,len=data.stateProdData.length;i<len;i++) {
    for(var j=0,length=data.stateProdData[i].Data.length;j<length;j++) {
      if(i==0) {
          extratedYearDataforMinMax[j]= {prodYear : data.stateProdData[i].Data[j].value,
                          grainName:data.stateProdData[i].Data[j].year};
      } else {
        extratedYearDataforMinMax[j].prodYear += data.stateProdData[i].Data[j].value;
      }
    }
  }

  var min = d3.min(extratedYearDataforMinMax,function(d) { return d.prodYear; });
  var max = d3.max(extratedYearDataforMinMax,function(d) { return d.prodYear; });

  yAxisScale=d3.scale.linear()
        .domain([max,min])
        .range([0+padding.top,height-padding.bottom]),
  yscale=d3.scale.linear()
    .domain([min,max])
    .range([0,height-padding.bottom-padding.top]);


  var g = drawBase(3,extratedYearDataforMinMax);
  drawStackedChart(g,data.stateProdData);

};

// reading JSON files
for(var i=0;i<4;i++) {
  (function(index) {
    d3.json(jsonFileNames[index], function(err,data) {
      switch(index){
        case 0:
        case 1:
          process2013Prod(index,data);
          break;
        case 2:
          processCCAggregate(data);
          break;
        case 3:
          processFourStateRiceProd(data);
          break;
      }
    });
  })(i);
}
