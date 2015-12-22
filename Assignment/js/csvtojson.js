var Seed = {
  /* grainName & prodYear2013 used for first two json file generation */
  grainName : "",
  prodYear2013 : 0,
  commercialCropArr : [0,0,0,0,0,0,
                      0,0,0,0,0], // 11 years aggregate value intialized to zero for Commercial Crop
  grainDetected : -1, //0 - food , 1 - oil seed, 2 - Commercial crops
  foodGrainOmmitWords : ["Production","Volume"],
  foodGrainSelectedUnit : "Ton mn",
  keywords : ["Agricultural Production Foodgrains",
              "Agricultural Production Oilseeds",
              "Agricultural Production Commercial Crops"],
  jsonFileNames : ["json/FoodGrain13Prod.json",
                   "json/OilSeed13Prod.json",
                   "json/CommercialCropVsYears.json"],
  lineOnePrinted : [false,false],

  isSeed : function(seedName,unit) {
    var selectedKeyWord = "";
    //Finding Category of Grain Seed
    if((seedName.indexOf(this.keywords[0]) > -1) && (unit.indexOf(this.foodGrainSelectedUnit) > -1)) {
      selectedKeyWord = this.keywords[0];
      this.grainDetected = 0; //found food grain
    } else if (seedName.indexOf(this.keywords[1]) > -1) {
      selectedKeyWord = this.keywords[1];
      this.grainDetected = 1; //found oil seed
    } else if (seedName.indexOf(this.keywords[2]) > -1) { // Detecting Commercial Crops
      console.log(seedName);
      selectedKeyWord = this.keywords[2];
      this.grainDetected = 2; //found Commercial Crops seed
    }
    if(this.grainDetected > -1){
      this.grainName = seedName.substr(selectedKeyWord.length+1,seedName.length-selectedKeyWord.length).trim();
      if(this.grainName.length > 0) {
        if(this.grainDetected==0) { // Validating Food Grain
          /* Checking Ommited words */
          for(var i=0; i<4; i++) {
            if(this.grainName.indexOf(this.foodGrainOmmitWords[i]) > -1) {
              // ommited word found
              return false;
            }
          }
        }
        return true;
      }
    }
    return false;
  },
  setSeedProd13 : function(prod13) {
    this.prodYear2013 = prod13;
  },
  setComercialCropAggrData : function(inputArr) {
    for(var i=14;i<=24;i++) {
      if(inputArr[i]!=="NA"){
        this.commercialCropArr[i-14] += parseFloat(inputArr[i]);
      }
      console.log(this.grainName + " year: " + (2003+i) + " value: " + this.commercialCropArr[i-14]);
    }
    console.log("---------------------------------end -------------------------");
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
          outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.commercialCropArr[i] + "},\n\t\t";
        outStr += "{ \"year\" : " + (2003+i) + ", \"value\" : " + this.commercialCropArr[i] + "}\n\t]\n}"
        return outStr;
        break;
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
        Seed.lineOnePrinted[Seed.grainDetected]=true;
        break;
      case 2:
        console.log(Seed.grainDetected);
        Seed.setComercialCropAggrData(lineArr);
        break;
      default:
        break;
    }
  }
});

lineReader.on('close',function() {
  for(var i=0;i<2;i++) {
    Seed.grainDetected = i;
    Seed.appendData("\n]");
  }
  Seed.grainDetected=2;
  Seed.appendData(Seed.toString());
  lineReader.close();
});
