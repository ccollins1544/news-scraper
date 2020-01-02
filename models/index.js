const path = require('path');
module.exports = {
  Article: require(path.join(__dirname, 'Article')),
  Note: require(path.join(__dirname, 'Note'))
}