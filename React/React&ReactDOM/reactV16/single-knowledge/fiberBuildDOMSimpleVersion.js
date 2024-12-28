import element from "./virtualDOM";
const PLACEMENT = 'PLACEMENT'

let container = document.getElementById('root');

// 下一个工作单元，工作单元即fiber
// fiber其实也是一个普通的对象
// 总结：fiber是一个具有规定好的属性的对象，是解耦处理的最小工作单元
// （为啥是最小，因为也有可能两个fiber节点的处理时间比较短，剩余时间可以囊括处理这两个fiber的时间）

// 首先是一个【开始】节点，注意这是开始节点，对应的是root，不是真正的网页树上面的任意一个节点
let workingInProgressRoot = {
  // 此fiber对应的dom节点
  stateNode: container,
  // fiber的属性
  props: {
    children: [
      element,
    ]
  }
  // 还有别的属性，在beginWork和completeUnitOfWork会赋予
  // type
  // return、child（是大儿子，不是儿子们）、sibling
  // effectTag：表明这个节点需要更新，需要进行增删改的操作
  // nextEffect、firstEffect、lastEffect
};

// 这里为什么要额外弄一个变量出来？？？？？
// 因为透传进去的nextUnitOfWork是一直在变化的，而workingInProgressRoot可以保持不变
// nextUnitOfWork目的是在顶层记录当前遍历到哪个节点，下次重启的时候，直接就能够取到上次还没执行的节点
let nextUnitOfWork = workingInProgressRoot;


// 总调度器，是与浏览器侧进行交流的窗口
// 每操作完一个虚拟DOM就探出头来看是不是还有剩余的时间

function workLoop(deadline) {
  // 如果有当前的工作单元，就去执行，然后返回下一个工作单元
  // 目的是直接覆盖一个对象，复用一个对象，减少内存开销
  console.log('deadline.timeRemaining()', deadline.timeRemaining())
  // 一、协调阶段
  while (nextUnitOfWork && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  // 二、提交阶段
  if (!nextUnitOfWork) {
    commitRoot();
  } else {
    // 如果这个时候nextUnitOfWork还有(且这个nextUnitOfWork是还没操作过的)，但是剩余时间没有了：
    // 就进入下一帧，在下一帧的空间时间再执行workLoop，这个时候的nextUnitOfWork因为写在顶层，所以存储着当前将要处理但是还没处理的dom节点
    requestIdleCallback(workLoop, { timeout: 1000 })
  }
}


// 一、协调阶段
// 遍历顺序的总控制器
function performUnitOfWork(workingInProgressFiber) {
  // 1.创建真实dom，并没有挂载。2.同时创建fiber子树
  beginWork(workingInProgressFiber);

  // 一开始的workingInProgressFiber没有对应到任何真实的dom上面（其实有，是root，但不是用户写的代码的顶层节点），算是一个“开始”的节点
  // 遍历顺序1：探底，从上到下（while在总控制器那边，因为要看剩余时间是否足够）
  // 首先，有儿子就找儿子【一直探到最底层】
  if (workingInProgressFiber.child) {
    return workingInProgressFiber.child
  }
  // 遍历顺序2：横向 + 从下到上（while正常写，在里面）
  // 没有儿子，找兄弟
  while(workingInProgressFiber) {
    // 最底层没有儿子的或者儿子已经处理完成回到这里，当前对应的节点进入下一环节,在这一环节当前节点算完成了
    completeUnitOfWork(workingInProgressFiber);

    if (workingInProgressFiber.sibling) {
      return workingInProgressFiber.sibling
    }
    // 没有兄弟，回到父亲那里，找父亲的兄弟，【往上且横向遍历】
    workingInProgressFiber = workingInProgressFiber.return;
  }

}

// 1.1 第一步：beginWork：
  // 1.创建此fiber的真实DOM属性  
  // 2.通过虚拟DOM创建本fiber的所有孩子fiber树结构

function beginWork(workingInProgressFiber) {
  // 下面是创建了一个节点，且附上属性，但是没有挂载到真实的DOM上面！
  if (!workingInProgressFiber.stateNode) {
    workingInProgressFiber.stateNode = document.createElement(workingInProgressFiber.type);
    // 附上属性!
    for (let key in workingInProgressFiber.props) {
      if (key !== 'children') {
        workingInProgressFiber.stateNode[key] = workingInProgressFiber.props[key]
      }
    }
  }
  // 创建子fiber，每一个子fiber是挂在previousFiber的sibling上面，以链表的形式
  let previousFiber;
  if (Array.isArray(workingInProgressFiber.props.children)) {
    workingInProgressFiber.props.children.forEach((child, index) => {
      let childFiber = {
        type: child.type,
        props: child.props,
        return: workingInProgressFiber,
        effectTag: PLACEMENT, // 这个fiber对应的dom需要被插入到父dom里面去
        nextEffect: null, // 下一个有副作用的节点
      }
      if (index === 0) {
        workingInProgressFiber.child = childFiber;
      } else {
        previousFiber.sibling = childFiber;
      }
      previousFiber = childFiber;
    })
  }
}

// 1.2 第二步：为已经构建好的fiber对象构建副作用链
function completeUnitOfWork(workingInProgressFiber) {
  // 构建副作用链effectList，上面只有副作用的节点，也就是有变化的节点
  // 每个节点的firstE和lastE指向本节点及本节点的孩子节点的首尾副作用节点，
  // 然后再向上合并！
  // 每个节点的firstE还要通过next指向下一个节点，这样，每个节点都连接着一条完整的链条，都可以拿到这条链条上面的每一个节点


  // 下面的代码可以总结为：【le必须重新连，fe无才重新连】
  let returnFiber = workingInProgressFiber.return;
  if (returnFiber) {
    // 1. 首先把自己的后代的副作用链合并到父节点上
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = workingInProgressFiber.firstEffect;
    }
    if (workingInProgressFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber.firstEffect;
      }
      returnFiber.lastEffect = workingInProgressFiber.lastEffect;
    }

    // 2. 然后再把自己合并到父亲节点上
    if (workingInProgressFiber.effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber;
      } else {
        returnFiber.firstEffect = workingInProgressFiber;
      }
      returnFiber.lastEffect = workingInProgressFiber;
    }
  }
}



// 二、提交阶段（必须同步执行，不能被打断）
// 挂载节点！！

function commitRoot() {
  let currentFiber = workingInProgressRoot.firstEffect;
  while(currentFiber) {
    if (currentFiber.effectTag === PLACEMENT) {
      currentFiber.return.stateNode.appendChild(currentFiber.stateNode)
    }
    currentFiber = currentFiber.nextEffect;
  }
  // 这里为什么要把他弄成是null？？？
  workingInProgressRoot = null;
}



// 告诉浏览器在空闲的时候，执行react的任务
requestIdleCallback(workLoop);




// vue没有fiber，vue的优化思路不一样
// vue把每个任务分割得足够小
// vue是基于模板和watch的组件级别的更新，更新范围比较小
// vue3采用模板标记更新，能很快地定位到更新的地方进行更新

// react的任务还是很大，但是分割成多个小任务，可以中断和恢复，不阻塞主进程执行高优先级任务
// react不管在哪里调用setState，都是从根节点开始更新的？？？？？
// （我觉得v15不是从根节点，是从setState所在的那个类组件的render出来的虚拟DOM开始的）









// 人生而不同，有些人却用一生来害怕自己的不同


