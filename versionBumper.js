var fs = require('fs');

var manifestFilename = 'src/manifest.json';
var newVersion = process.argv.slice(2)[0];

var manifestJsonObj = JSON.parse(fs.readFileSync(manifestFilename, 'utf8'));

//Bump Version if specified as command line argument
console.log("Current Version:", manifestJsonObj.version);
manifestJsonObj.version = newVersion || manifestJsonObj.version;
console.log("Updated Version:", manifestJsonObj.version);

fs.writeFile(manifestFilename, JSON.stringify(manifestJsonObj, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Manifest saved to " + manifestFilename);
    }
}); 