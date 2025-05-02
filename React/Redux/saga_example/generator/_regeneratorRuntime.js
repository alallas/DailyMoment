class Context {
  next = 0;
  done = false;
  stop() {
    this.done = true;
  }
}

exports.mark = function (genFunc) {
  return genFunc;
};

exports.wrap = function (innerFn, outerFn) {
  // generatorExample$ 是 inner
  // generatorExample 是 outer
  const generator = Object.create(outerFn.prototype);
  const context = new Context();
  generator.next = (arg) => {
    context.sent = arg;
    const value = innerFn(context);
    return {
      value,
      done: context.done,
    };
  };
  return generator;
};
