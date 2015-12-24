var censusByCasteFileNames = ["../csv/India2011.csv",
                              "../csv/IndiaSC2011.csv",
                            "../csv/IndiaST2011.csv"];

var Census = {
  AgeWiseLiteratePopulation : [],
  GraduatePopulationByStateAndGender : [],
  EducationCategoryPopulation : [],
  omitAges : ["All ages","0-6"],
  omitRU : ["Rural","Urban"],
  ageArray : {}, // Key based array

  initializeAgeArry : function() {
    var i=0;
    for(;i<13;i++)
      this.ageArray["ageG" + (i+7)] = i;
    for(i=13,j=20;i<26;i++,j=j+5)
      this.ageArray["ageG" + j] = i;
    this.ageArray["ageGAg"] = i;
  },

  validateConstrains : function(total,ageGroup) {
    for(var i=0,ageLen=this.omitAges.length;i<ageLen;i++) {
      if(ageGroup === this.omitAges[i])
        return false;
    }
    for(var i=0,ruLen=this.omitRU.length;i<ruLen;i++) {
      if(total === this.omitRU[i])
        return false;
    }
    return true;
  },

  processData : function(lineArr) {
    var ageIndex =this.ageArray["ageG" + lineArr[5].substr(0,2)];
    //Age calculation
    if(this.AgeWiseLiteratePopulation[ageIndex] == undefined) {
      this.AgeWiseLiteratePopulation[ageIndex] = { label : lineArr[5], population : parseInt(lineArr[12]) };
    }
    else {
      this.AgeWiseLiteratePopulation[ageIndex].population += parseInt(lineArr[12]);
    }

    //Graduates Population By State with Gender comparison

    
    //Education Category Wise Population

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

var fs = require('fs'),
  readline = require('readline'),
  ignoredFirstLine=[false,false,false];
Census.initializeAgeArry();
for(var i=0;i<censusByCasteFileNames.length;i++){
  (function(index) {
    var lineReader = readline.createInterface({
        input: fs.createReadStream(censusByCasteFileNames[i])
      });


    lineReader.on('line', function (line) {
        var lineArr = CSVtoArray(line); // converting line to array
        if(ignoredFirstLine[index] && Census.validateConstrains(lineArr[4],lineArr[5])) {
          Census.processData(lineArr);
        }
        ignoredFirstLine[index]=true;
    });

    lineReader.on('close',function() {
      lineReader.close();
    });
  })(i);
}
