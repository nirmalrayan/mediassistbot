var NodeGeocoder = require('node-geocoder');

function testmodule(){
var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyDPyP4r_WlBSc81KhA15jsgNS4lXW4tmrE', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

// Using callback
geocoder.geocode('29 champs elysée paris', function(err, res) {
  console.log("Result: "+res);
  console.log("Error:"+ err);
});
}

module.exports = testmodule;