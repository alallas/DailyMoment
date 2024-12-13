const SingleEntryPlugin = require('./SingleEntryPlugin.js');

const itemToPlugin = (context, item, name) => {
  return new SingleEntryPlugin(context, item, name)
}

class EntryOptionPlugin {

  apply(compiler) {
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
      if (typeof entry === 'string') {
        itemToPlugin(context, entry, 'main').apply(compiler)
      } else {
        for (let entryName in entry) {
          itemToPlugin(context, entry[entryName], entryName).apply(compiler)
        }
      }

    })
  }

}

module.exports = EntryOptionPlugin;



