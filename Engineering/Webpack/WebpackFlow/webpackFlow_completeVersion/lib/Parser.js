const babylon = require('babylon');
const { Tapable } = require('tapable');

class Parser{
  parse(source) {
    return babylon.parse(source, {
      sourceType: 'module',
      plugins: ['dynamicImport'],
    })
  }
}


module.exports = Parser;

