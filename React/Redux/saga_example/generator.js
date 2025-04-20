function* generator() {
  try {
    let a = yield 1;
    console.log(a);
    let b = yield 2;
    console.log(b);
  } catch {

  }
}

// const instruct = generator();
// console.log(instruct.next());
// console.log(instruct.next('1--'));
// console.log(instruct.next('2--'));

function co(generator) {
  // 外面是第一次调用next
  let it = generator();
  let res;
  // 里面是第二及往后多次调用
  function next(arg) {
    res = it.next(arg);
    if (!res.done) {
      next(res.value);
    }
  }
  // 第一次调用next不需要入参
  next();
}


co(generator);





