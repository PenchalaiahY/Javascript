var prod = {
  grainName : "",
  prodYear2013 : 0
};

var fourSouthStatesProd = {
  state : "",
  Data : [ { "year" : 2003, "value" : 0},
		{ "year" : 2004, "value" : 0},
		{ "year" : 2005, "value" : 0},
		{ "year" : 2006, "value" : 0},
		{ "year" : 2007, "value" : 0},
		{ "year" : 2008, "value" : 0},
		{ "year" : 2009, "value" : 0},
		{ "year" : 2010, "value" : 0},
		{ "year" : 2011, "value" : 0},
		{ "year" : 2012, "value" : 0},
		{ "year" : 2013, "value" : 0}
  ]
};

var commercialCropProd = {
  grainName : "Commercial Crop",
	aggregateValue : [ { "year" : 2003, "value" : 0},
		{ "year" : 2004, "value" : 0},
		{ "year" : 2005, "value" : 0},
		{ "year" : 2006, "value" : 0},
		{ "year" : 2007, "value" : 0},
		{ "year" : 2008, "value" : 0},
		{ "year" : 2009, "value" : 0},
		{ "year" : 2010, "value" : 0},
		{ "year" : 2011, "value" : 0},
		{ "year" : 2012, "value" : 0},
		{ "year" : 2013, "value" : 0}
	]
}

var Seed = {
  /* grainName & prodYear2013 used for first two json file generation */
  grainName : "",
  prodYear2013 : 0,
  comercialCropYearDataArr : [0,0,0,0,0,0,
                              0,0,0,0,0], // 11 years aggregate value intialized to zero for Commercial Crop
  fourSouthStatesYearDataArr : [0,0,0,0,0,0,
                              0,0,0,0,0],
  grainDetected : -1, //0 - food , 1 - oil seed, 2 - Commercial crops
  foodGrainOmmitWords : ["Production","Volume"],
  foodGrainSelectedUnit : "Ton mn",
  keywords : ["Agricultural Production Foodgrains",
              "Agricultural Production Oilseeds",
              "Agricultural Production Commercial Crops",
              "Agricultural Production Foodgrains Rice Volume"],
  fourSouthStates : ["Andhra Pradesh",
                     "Karnataka",
                     "Kerala",
                     "Tamil Nadu"],
  jsonFileNames : ["json/FoodGrain13Prod.json",
                   "json/OilSeed13Prod.json",
                   "json/CommercialCropVsYears.json",
                   "json/FourStateRiceProdVsYears.json"],
  lineOnePrinted : [false,false,false,false],

  isSeed : function(seedName,unit) {
    var selectedKeyWord = "";
    //Finding Category of Grain Seed
    for(var i=0;i<4;i++) {
      if(seedName.indexOf(this.keywords[i]) > -1) {
        if(i>0 || (i==0 && unit.indexOf(this.foodGrainSelectedUnit) > -1))
        {
          selectedKeyWord = this.keywords[i];
          this.grainDetected = i;
        }
      }
    }
    var returnValue =false;
    if(this.grainDetected > -1){
      prod.grainName = seedName.substr(selectedKeyWord.length+1,seedName.length-selectedKeyWord.length).trim();
      if(prod.grainName.length > 0) {
        if(this.grainDetected==0) { // Validating Food Grain
          /* Checking Ommited words */
          for(var i=0; i<4; i++) {
            if(prod.grainName.indexOf(this.foodGrainOmmitWords[i]) > -1)
              return returnValue; // ommited word found
          }
        } else if(this.grainDetected==3) {
          for(var i=0;i<4;i++) {
            if(prod.grainName.indexOf(this.fourSouthStates[i]) > -1) {
              fourSouthStatesProd.state = prod.grainName;
              returnValue= true;
            }
          }
          return returnValue;
        }
        return true;
      }
    }
    return returnValue;
  },
  setSeedProd13 : function(prod13) {
    prod.prodYear2013 = prod13;
  },
  setYearArr : function(inputArr) {
    for(var i=13;i<=23;i++) {
      if(inputArr[i]!=="NA"){
        if(Seed.grainDetected==2) {
          commercialCropProd.aggregateValue[i-13].value += parseFloat(inputArr[i]);
        }
        else if(Seed.grainDetected==3)
          fourSouthStatesProd.Data[i-13].value = parseFloat(inputArr[i]);
      } else if(Seed.grainDetected==3) {
        fourSouthStatesProd.Data[i-13].value = 0;
      }
    }
  },
  appendData : function(data) {
    fs.appendFile(this.jsonFileNames[this.grainDetected],data,function(err) {
      if(err)
        console.log(err);
      //console.log('The "data to append" was appended to file!');
    });

  },
  toString : function() {
    switch (this.grainDetected) {
      case 0: //first 2 2013 json file to string generation
      case 1:
        //console.log(this.grainName + " : " + this.grainDetected + "-" + this.lineOnePrinted[this.grainDetected]);
        if(this.lineOnePrinted[this.grainDetected]) {
          //return ",\n\t{ \"grainName\" : \"" + this.grainName + "\", \"prodYear2013\" : " + this.prodYear2013 + "}";
          return ",\n\t" + JSON.stringify(prod,null,'\t');
        } else {
          return "[\n\t" + JSON.stringify(prod,null,'\t');
        }
        break;
      case 2: // Commercial crops
        return JSON.stringify(commercialCropProd,null,'\t');
        break;
      case 3: // 4 State Prod Data
        var outStr = "";
        if(!this.lineOnePrinted[this.grainDetected]) {
          outStr = "{\n\t\"grainName\" : \"Rice\",\n\t" +
                    "\"stateProdData\" : [\n\t\t";
        } else {
          outStr = ",";
        }
        outStr += "\n\t\t\t" + JSON.stringify(fourSouthStatesProd,null,'\t');
        return outStr;
    }
  }
};


// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};

/* ------- Parsing section -------- */
var fs = require('fs'),
/*    csv = require('fast-csv'),
    stream = fs.createReadStream("../Production-Department_of_Agriculture_and_Cooperation_1.csv");

csv.fromStream(stream,{quote : '"'})
  .on("data",function(line) {
    Seed.grainDetected=-1;
    if(Seed.isSeed(line[0],line[2])) {
      switch (Seed.grainDetected) {
        case 0:
        case 1:
          Seed.setSeedProd13(line[23]);
          Seed.appendData(Seed.toString());
          break;
        case 2:
          Seed.setYearArr(line);
          break;
        case 3:
          Seed.setYearArr(line);
          Seed.appendData(Seed.toString());
        default:
          break;
      }
      Seed.lineOnePrinted[Seed.grainDetected]=true;
    }
  })
  .on("end",function() {
    for(var i=0;i<2;i++) {
      Seed.grainDetected = i;
      Seed.appendData("\n]");
    }
    Seed.grainDetected=2;
    Seed.appendData(Seed.toString());
    Seed.grainDetected=3;
    Seed.appendData("\n\t]\n}");
    stream.close();
  }); */

    readline = require('readline'),
    lineReader = readline.createInterface({
      input: require('fs').createReadStream("../Production-Department_of_Agriculture_and_Cooperation_1.csv")
    });


lineReader.on('line', function (line) {
  var lineArr = CSVtoArray(line); // converting line to array
  Seed.grainDetected=-1;
  if(Seed.isSeed(lineArr[0],lineArr[2])) {
    switch (Seed.grainDetected) {
      case 0:
      case 1:
        Seed.setSeedProd13(lineArr[23]);
        Seed.appendData(Seed.toString());
        break;
      case 2:
        Seed.setYearArr(lineArr);
        break;
      case 3:
        Seed.setYearArr(lineArr);
        Seed.appendData(Seed.toString());
      default:
        break;
    }
    Seed.lineOnePrinted[Seed.grainDetected]=true;
  }
});

lineReader.on('close',function() {
  for(var i=0;i<2;i++) {
    Seed.grainDetected = i;
    Seed.appendData("\n]");
  }
  Seed.grainDetected=2;
  Seed.appendData(Seed.toString());
  Seed.grainDetected=3;
  Seed.appendData("\n\t]\n}");
  lineReader.close();
});
