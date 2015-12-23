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
      this.grainName = seedName.substr(selectedKeyWord.length+1,seedName.length-selectedKeyWord.length).trim();
      if(this.grainName.length > 0) {
        if(this.grainDetected==0) { // Validating Food Grain
          /* Checking Ommited words */
          for(var i=0; i<4; i++) {
            if(this.grainName.indexOf(this.foodGrainOmmitWords[i]) > -1)
              return returnValue; // ommited word found
          }
        } else if(this.grainDetected==3) {
          for(var i=0;i<4;i++) {
            if(this.grainName.indexOf(this.fourSouthStates[i]) > -1) {
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
    this.prodYear2013 = prod13;
  },
  setYearArr : function(inputArr) {
    for(var i=14;i<=24;i++) {
      if(inputArr[i]!=="NA"){
        if(Seed.grainDetected==2) {
          this.comercialCropYearDataArr[i-14] += parseFloat(inputArr[i]);
        }
        else if(Seed.grainDetected==3)
          this.fourSouthStatesYearDataArr[i-14] = parseFloat(inputArr[i]);
      } else if(Seed.grainDetected==3) {
        this.fourSouthStatesYearDataArr[i-14] = 0;
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
          return ",\n\t{ \"grainName\" : \"" + this.grainName + "\", \"prodYear2013\" : " + this.prodYear2013 + "}";
        } else {
          return "[\n\t{ \"grainName\" : \"" + this.grainName + "\", \"prodYear2013\" : " + this.prodYear2013 + "}";
        }
        break;
      case 2: // Commercial crops
        var outStr = "{\n\t\"grainName\" : \"Commercial Crop\",\n\t" +
                        "\"aggregateValue\" : [ ";
        for(var i=0;i<10;i++)
          outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.comercialCropYearDataArr[i] + "},\n\t\t";
        outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.comercialCropYearDataArr[i] + "}\n\t]\n}"
        return outStr;
        break;
      case 3: // 4 State Prod Data
        var outStr = "";
        if(this.lineOnePrinted[this.grainDetected]) {
          outStr = ",\n\t\t{\"state\" : \"" + this.grainName + "\",\n\t\t\t" +
                      "\"Data\" : [ ";
        } else {
          outStr = "{\n\t\"grainName\" : \"Rice\",\n\t" +
                    "\"stateProdData\" : [\n\t\t{ \"state\" : \"" + this.grainName + "\",\n\t\t\t" +
                  "\"Data\" : [ ";
        }
        for(var i=0;i<10;i++)
          outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.fourSouthStatesYearDataArr[i] + "},\n\t\t\t\t";
        outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.fourSouthStatesYearDataArr[i] + "}\n\t\t\t]\n\t\t}"
        return outStr;
    }
  }
};


/* ------- Parsing section -------- */
var fs = require('fs'),
    readline = require('readline'),
    lineReader = readline.createInterface({
      input: require('fs').createReadStream("../Production-Department_of_Agriculture_and_Cooperation_1.csv")
    });

lineReader.on('line', function (line) {
  var lineArr = line.split(','); // converting line to array
  Seed.grainDetected=-1;
  if(Seed.isSeed(lineArr[0],lineArr[3])) {
    switch (Seed.grainDetected) {
      case 0:
      case 1:
        Seed.setSeedProd13(lineArr[24]);
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
