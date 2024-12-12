let Hook = require('./Hook')
let HookCodeFactory = require('./HookCodeFactory')

const factory = new HookCodeFactory();

class SyncHook extends Hook{
  compile(options) {
    factory.setup(this, options);
    return factory.create()
  }

}

module.exports = SyncHook