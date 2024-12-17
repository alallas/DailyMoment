

// react不是把事件绑定到dom节点上面，而是绑定到document上面
// 1.合成事件可以屏蔽浏览器的差异
// 2.合成可以实现事件对象的复用，和重用，减少垃圾回收，提高性能
// 3.默认实现批量更新，可以把两个setState合并成一次更新


function addEvent(dom, eventType, listener) {
  eventType = eventType.toLowerCase();

  // 创建一个仓库，用来保存回调函数和事件名字，并且这个仓库对象是挂到dom上面的！！目的是为了后面在处理回调函数的时候可以通过dom直接拿到他自己身上绑定的事件函数
  // PS：写法真的很源码！！！
  let eventStore = dom.eventStore || (dom.eventStore = {})
  eventStore[eventType] = listener;

  // 挂事件，注意是往document上面挂事件！ 且源码会对浏览器的兼容进行处理
  // false表示在冒泡阶段处理，而非捕获阶段
  document.addEventListener(eventType.slice(2), dispatchEvent, false);
}

// 这是包装过的event对象，为什么放在dispatchEvent处理函数的外面？？
// 是因为如果我事件触发很多次，我都可以直接复用这个event对象，不用每次都新找一个内存然后存放然后垃圾清理。
// 而是直接复用以前的，某些属性值重新覆盖一遍就好，内存空间还是那个内存空间
let syntheticEvent;


// 真正事件触发的方法统一在这里走(注意哦是所有的事件！)
// event是html浏览器传递的原生的事件对象，而这里的传递的这个event不是那个event，需要对这个原生的event做一些封装
function dispatchEvent(event) {
  // 这里的type举例来说是click，target举例来说是button
  // type是事件，target是触发的对象
  let { type, target } = event;
  let eventType = 'on' + type;

  // 包装一下原生的event！也就是给一个新的event附上信息！
  syntheticEvent = getSyntheticEvent(event);

  // 只要有触发事件，就会生成event这时进入循环，执行回调函数。否则event是不存在的，进入不了循环
  // 这里在模拟事件冒泡
  while(event) {
    let { eventStore } = target;
    let listener = eventStore && eventStore[eventType];
    if (listener) {
      // 这时调用回调函数执行，注意是针对的具体节点进行执行！
      // 这个时候的syntheticEvent才是最终传递给外部写回调的时候的那个参数！！
      listener.call(target, syntheticEvent)
    }
    target = target.parentNode;
  }

  // 事件函数已经触发完毕之后，可以把合成事件对象里面的属性改为null空值，供下次用
  for (let key in syntheticEvent) {
    syntheticEvent[key] = null
  }
}

class SyntheticEvent {
  constructor() {
  }
}




function getSyntheticEvent(nativeEvent) {

  // 如果没有缓存的话，说明是第一次触发！需要创建一个缓存！！也即是一个包装过的event对象
  if (!syntheticEvent) {
    syntheticEvent = new SyntheticEvent();
  }

  // 首先绑定一些属性，方便到时候获取！
  syntheticEvent.nativeEvent = nativeEvent
  // 下面这一行的意义何在？？可以给到时外部写的event对象提供一个获取当前节点信息的属性！
  syntheticEvent.currentTarget = nativeEvent.target;


  // 把原生对象事件上面的方法和属性都拷贝到合成对象上面！！！！！
  for(let key in nativeEvent) {
    if (typeof nativeEvent[key] === 'function') {
      syntheticEvent[key] = nativeEvent[key].bind(nativeEvent);
    } else {
      syntheticEvent[key] = nativeEvent[key];
    }
  }
  return syntheticEvent;
}



export {
  addEvent,
}



