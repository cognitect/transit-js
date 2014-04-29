var decoder = require("decoder");

function JSONUnmarshaller() {}

JSONUnmarshaller.prototype = {
  unmarshal: function(str) {
    return JSON.parse(str);
  }
}


function read(stream, opts) {
  var unmarshaller = new JSONUnmarshaller();
}


module.exports = {
  decoder: decoder
};
