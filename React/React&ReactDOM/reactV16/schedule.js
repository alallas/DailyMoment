import { TAG_ROOT, ELEMENT_TEXT, TAG_TEXT, PLACEMENT, TAG_HOST } from "./constants";
import { setProps } from "./utils";


// 从根节点开始渲染和调度
// 两个阶段：
// 1. render阶段（diff阶段）
// 新旧对比虚拟DOM，进行创建、更新，生成一个副作用链表，任务拆分至最小的虚拟DOM单元，可暂停
// 2. commit阶段
// 进行真实的DOM更新创建阶段，此阶段不能暂停

// 顶层的fiber长这样，在render方法里面构建：
// tag: TAG_ROOT,
// stateNode: container,
// props: {
//   children: [
//     element,
//   ]
// }


// 这个是顶层用来记录当前处理到哪个节点的变量，一直被覆盖
let nextUnitOfWork = null;
// 这个变量不会一直变化，用来用在commit阶段
let workInProgressRoot = null;

function scheduleRoot(rootFiber) {
  nextUnitOfWork = rootFiber;
  workInProgressRoot = rootFiber;
}


function workLoop(deadline) {
  // 一、render阶段
  // 是否要让出控制权
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 剩下时间很少了，小于1ms，就要让出控制权，为true，这样的话，就退出循环了
    // 后面再一次进入workloop的时候，shouldYield又变成了fasle，也就是不需要让出控制权，直接执行，
    // 相当于每一次执行workLoop，不管剩下时间是多少，都会执行一次，然后才会判断下一次够不够时间
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 二、commit阶段
  // 加上workInProgressRoot的目的是
  // 防止后面什么动静都没有但是又要一直进入执行这个workLoop函数，走下面的commitRoot
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  // ! 不管有没有任务，都请求去再次调度，每一帧都要执行一次workloop（源码也是每一帧都会去执行，每次都会去调度）
  // 这意味着如果整个树构建完成nextUnitOfWork变为undefined（因为一直递归找下一个元素，那这个元素最终会变成undefined），不会重复进去while循环
  // 但是之后每次都会去走commit函数，即使进去这个方法内，也需要因为没有effectList而退出。
  requestIdleCallback(workLoop, { timeout: 500 })
}



// 一、render阶段
function performUnitOfWork(currentFiber) {
  // 1.1 构建fiber树 + 新建真实的DOM
  beginWork(currentFiber)

  // 开始定义遍历顺序
  // 遍历顺序1：探底，从上到下（while在总控制器那边，因为要看剩余时间是否足够）
  // 首先，有儿子就找儿子【一直探到最底层】
  if (currentFiber.child) {
    return currentFiber.child
  }

  // 遍历顺序2：横向 + 从下到上（while正常写，在里面）
  // 没有儿子，找兄弟
  while (currentFiber) {
    // 能够走到这说明是要么没有儿子了，到底层了
    // 要么所有儿子已经操作完了（大儿子及其兄弟们）
    // 这个时候就要进入下一步：
    // 1.2 构建副作用链
    completeUnitOfWork(currentFiber);
    // 【横向走】
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    // 没有兄弟，回到父亲那里，找父亲的兄弟，【往上遍历】
    currentFiber = currentFiber.return;
  }
}


// 1.1构建fiber树 + 新建真实的DOM
function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber)
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber)
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber)
  }
}

// 首先针对“根”fiber进行处理
function updateHostRoot(currentFiber) {
  // 先处理自己，如果是一个原生的节点，创建真实DOM
  // 但是因为TAG_ROOT的stateNode已经有了真实的DOM，所以不需要创建真实的DOM

  // 然后处理孩子，创建子fiber
  const newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren)
}

function updateHostText(currentFiber) {
  // 只需要处理自己，建立真实DOM
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}

function updateHost(currentFiber) {
  // 先处理自己，建立真实DOM
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
  // 然后处理孩子，建立孩子的fiber
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren)
}


function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    // 创建一个真实DOM元素节点
    let stateNode = document.createElement(currentFiber.type);
    // 附上属性
    updateDOM(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}

function updateDOM(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps)
}


function reconcileChildren(currentFiber, newChildren) {
  // 上一个子fiber
  let prevSibling;
  let newChildIndex = 0;

  // 其实这个可以直接用for循环吧！不就相当于是遍历root的孩子数组吗？？
  while (newChildIndex < newChildren.length) {
    let newChild = newChildren[newChildIndex];

    // 下面在定义节点的类型，我感觉放在createElement阶段会不会更好
    // 其实我觉得，在createElement阶段就把类型定义好，像v15，采用一个变量来定义到底是什么类型的节点会不会更好！！！
    let tag;
    if (newChild.type === ELEMENT_TEXT) {
      // 这是一个文本节点，是经过react处理的虚拟DOM（相当于尖括号里面的文字内容）
      // 这个文本的fiber相当于：{ tag: TAG_TEXT, type: ELEMENT_TEXT }
      
      tag = TAG_TEXT
    } else if (typeof newChild.type === 'string') {
      // 这是一个原生的dom节点，type就是div，span这种
      // 这里就像v15的&&typeof的ELEMENT
      tag = TAG_HOST
    }

    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT,
      nextEffect: null,
      // effectList和完成顺序是一样的，但是节点比较少
    }
    // 这里在构建fiber的树结构，做好child和sibling的指向
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    }

    newChildIndex++;
  }

}


function completeUnitOfWork(currentFiber) {
  // 这里为什么要先处理后代，然后再处理自己呢？？
  // 因为这是深度优先的遍历，儿子是首先遍历得到的，因此应该先把儿子放到祖父节点上，然后才是自己！！

  // 下面的代码可以总结为：【le必须重新连，fe无才重新连】
  // 因为fe一直是固定不变的，le一直在往后更新
  let returnFiber = currentFiber.return;
  if (returnFiber) {
    // 首先是合并自己的后代，先不管自己本身
    // fe的处理
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    // 然后处理自己
    if (currentFiber.effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        // fe的处理
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }

}



function commitRoot() {
  // 从这里可以看到，workInProgressRoot在这里用上了
  // 这个时候的fe指向的是最底层的元素节点
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }

  // 为什么要把这个workInProgressRoot恢复为null呢？？？
  // 因为如果workLoop是一直被调度的话，当整个树创建完成，也没有交互导致的更新的话
  // 那么就一直进入workLoop，也就会进入commitRoot。
  // 此时的workInProgressRoot是null的话，就拿不到.firstEffect，也就进不去while！！
  workInProgressRoot = null;
}

function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDOM = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode);
  }

  // 自己的真实DOM处理完之后，把自己的effectTag清空一下！！！
  currentFiber.effectTag = null;
}




// 每个帧空闲的时候进行执行
requestIdleCallback(workLoop, { timeout: 500 })





export {
  scheduleRoot,
}


