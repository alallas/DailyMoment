function stdChannel() {
  let currentTakers = [];
  function take(taker, matcher) {
    // matcher挂到taker函数上
    // taker是回调函数，matcher是匹配器
    taker['MATCH'] = matcher;
    currentTakers.push(taker);
    taker.cancel = () => {
      currentTakers = currentTakers.filter(v => v !== taker)
    }

  }
  function put(input) {
    for (let i = 0; i < currentTakers.length; i++) {
      let taker = currentTakers[i];
      if (taker['MATCH'](input)) {
        taker.cancel();
        taker(input);
      }
    }
  }
  return {take, put};
}

let channel = stdChannel();

function next() {
  console.log('继续执行')
}

// 用来检验传入的参数是否匹配？ 
function matcher(action) {
  return action.type === 'wrap-add';
}

channel.take(next, matcher);

channel.put({type: 'wrap-add'});
channel.put({type: 'wrap-add'});


// 类似于发布订阅的升级版！
// 订阅的时候说明这个函数的某个指令，发布的时候首先去找对应的指令

// 另外，要求这个订阅只触发一次，
// 也就是put函数被执行过一次之后，之后再执行就不能触发了
// 使用cancel函数解决，每次put执行，都把原本的函数从队列里面删掉



export default stdChannel;
