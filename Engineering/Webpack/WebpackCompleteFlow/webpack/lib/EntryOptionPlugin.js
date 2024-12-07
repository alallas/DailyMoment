const SingleEntryPlugin = require('./SingleEntryPlugin.js');

const itemToPlugin = (context, item, name) => {
  return new SingleEntryPlugin(context, item, name)
}

class EntryOptionPlugin {

  apply(compiler) {
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
      itemToPlugin(context, entry, 'main').apply(compiler)
    })
  }

}

module.exports = EntryOptionPlugin;



