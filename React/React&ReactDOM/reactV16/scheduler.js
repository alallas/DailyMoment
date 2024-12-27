import { TAG_ROOT, ELEMENT_TEXT, TAG_TEXT, PLACEMENT, TAG_HOST, DELETION, UPDATE, TAG_CLASS } from "./constants";
import { UpdateQueue } from "./update";
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


// 下面两个变量是正在渲染的根root fiber
// 这个是顶层用来记录当前处理到哪个节点的变量，一直被覆盖，用在render阶段
let nextUnitOfWork = null;
// 这个变量一方面用来用在commit阶段，拿到副作用链条，
// 另一方面在双缓存那边用来保存最新的一颗树，一直被覆盖
let workInProgressRoot = null;


// 更新阶段：再弄一棵树
// 下面这个是渲染成功之后当前的根root fiber
let currentRoot = null;
// 被删除的节点不放在effect list里面，需要单独记录并执行
let deletions = [];


// 再次进入这个函数是什么时候？？
// 刷新页面？？？？
function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    // 1. 说明已经更新过一次了，是第二次更新

    // 这个时候直接用初始渲染出来的那个树，把他当做一个新的树
    workInProgressRoot = currentRoot.alternate;
    // 替换一下原来的props
    workInProgressRoot.props = rootFiber.props;
    // 让新的这个替换过的workInProgressRoot树（相当于一个新的树，其实是之前的旧树currentRoot.alternate）的alternate指向currentRoot旧树（注意：currentRoot存的永远是上一次的树！！）
    workInProgressRoot.alternate = currentRoot;

  } else if (currentRoot) {
    // 2. 说明至少已经渲染过一次了，是第一次更新
  
    // 让新的树的一个alternate属性指向旧树对应的节点
    rootFiber.alternate = currentRoot;
    // 更新一下当前正在渲染的树
    workInProgressRoot = rootFiber;

  } else {
    // 3. 第一次渲染：

    // 第一次构建第一颗树！！！
    workInProgressRoot = rootFiber;
  }

  // 保险动作：
  // 把firsteffect等等的指针全部清空。
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null;
  nextUnitOfWork = workInProgressRoot;
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
  } else if (currentFiber.tag === TAG_CLASS) {
    updateClassComponent(currentFiber)
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


// 这里面的diff的逻辑是：
// 一一对比，一个位置对应的节点与相同位置的节点进行对比，暂时没有涉及到key的复用
function reconcileChildren(currentFiber, newChildren) {
  // 更新时：
  // 拿到老的currentFiber的大儿子
  // 写在这是因为链表的遍历需要一个外部变量来记住当前的节点
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;

  // 第一次新建时：
  // 上一个子fiber
  let prevSibling;
  let newChildIndex = 0;

  // 其实这个可以直接用for循环吧！不就相当于是遍历root的孩子数组吗？？
  // 但是，要加上oldFiber的循环条件！！！为什么？？？
  // 因为当前的节点的孩子节点的长度是不定的，不能保证遍历本次的孩子节点数组，都能够把新旧的节点都遍历完（那为什么要把新旧孩子的数组都遍历完呢？）
  // 加上oldFiber说明，只要旧的有，或新的长度比较长，都可以把新旧孩子的数组都遍历完
  while (newChildIndex < newChildren.length || oldFiber) {
    let newChild = newChildren[newChildIndex];
    let newFiber;

    // 首次新建时：
    // 下面在定义节点的类型，我感觉放在createElement阶段会不会更好
    // 其实我觉得，在createElement阶段就把类型定义好，像v15，采用一个变量来定义到底是什么类型的节点会不会更好！！！
    let tag;
    if (newChild && typeof newChild.type === 'function' && newChild.type.prototype.isReactComponent) {
      // 这是一个类组件
      tag = TAG_CLASS
    } else if (newChild && newChild.type === ELEMENT_TEXT) {
      // 这是一个文本节点，是经过react处理的虚拟DOM（相当于尖括号里面的文字内容）
      // 这个文本的fiber相当于：{ tag: TAG_TEXT, type: ELEMENT_TEXT }
      tag = TAG_TEXT
    } else if (newChild && typeof newChild.type === 'string') {
      // 这是一个原生的dom节点，type就是div，span这种
      // 这里就像v15的&&typeof的ELEMENT
      tag = TAG_HOST
    }

    // 更新时：
    const sameType = oldFiber && newChild && oldFiber.type === newChild.type;

    // 新老fiber的type一样，很多东西可以直接复用老的，尤其是真实DOM
    // 新老fiber的type不一样，就需要新建了
    // !但是，不管一不一样，为啥首次新建和每次更新的fiber都是重新创建一个的？？？
    // 这对性能造成很大的负面影响，不断更新，不断创建新的对象，即使有双缓冲，也只是缓存了根节点，而子节点在更新的时候还是会每次都建一个新的
    if (sameType) {
      // 这种情况
      // 1.要么是第二次更新，有一个额外的没有用的树（第一次渲染的树），可以直接拿来用
      // 2.要么是第一次更新，只有一个oldFiber的树，这个树要拿来对比，不能覆盖掉
      if (oldFiber.alternate) {
        // 说明已经更新过一次了，是第二次往后的更新
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.nextEffect = null;
      } else {
        // 说明还没有更新过，是第一次更新
        newFiber = {
          tag: oldFiber.tag, // 直接用老的
          type: oldFiber.type, // 直接用老的
          props: newChild.props, // props肯定是用新的，有可能类型一样但属性有变化
          stateNode: oldFiber.stateNode, // 直接用老的
          alternate: oldFiber, // 指向老的
          return: currentFiber,
          effectTag: UPDATE,
          nextEffect: null,
        }
      }
    } else {
      // 这种情况
      // 1.要么oldFiber没有newChild有需要新建，
      // 2.要么newChild没有oldFiber有需要删除，
      // 3.要么两者都有，但是类型不一样（老的删掉，且需要新建）
      if (newChild) {
        // 说明需要新建，1和3的情况
        newFiber = {
          tag,
          type: newChild.type,
          props: newChild.props,
          stateNode: null,
          return: currentFiber,
          effectTag: PLACEMENT,
          nextEffect: null,
          // effectList和完成顺序是一样的，但是节点比较少
        }
      }
      if (oldFiber) {
        // 说明需要删除老节点，2和3的情况
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }

    // 这里在构建fiber的树结构，做好child和sibling的指向，上面的属性没有他两个
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    }

    // 因为现在是一个老链表和一个新数组同时比较，新数组的index指针往后+1，老链表也需要向后覆盖，找下一个兄弟！
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    // 新数组的index指针往后+1
    newChildIndex++;
  }

}


function updateClassComponent(currentFiber) {
  // 注意，类组件的stateNode是组件的实例

  // 首次新建渲染逻辑：
  // 这里不是更新时会走的逻辑，更新时currentFiber.stateNode肯定存在，进不来！
  if (!currentFiber.stateNode) {
    // 创建实例！
    currentFiber.stateNode = new currentFiber.type(currentFiber.props)

    // 搞个双向指针！类组件的实例的一个internalFiber属性指向fiber
    // 1. 目的是让类组件也能拿到fiber，为update提供老fiber的信息
    currentFiber.stateNode.internalFiber = currentFiber;
    // 2. 目的是让currentFiber也能拿到更新器的一些属性和方法。
    currentFiber.updateQueue = new UpdateQueue();
  }

  // 更新的逻辑：
  // 执行forceUpdate，把老状态传给这个函数，更新类组件实例的state的属性
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state)
  // 重新执行render函数
  let newElement = currentFiber.stateNode.render();

  // 这里是把render的返回值作为孩子去处理，这是一个好思路！！！
  // 这些孩子的父亲是currentFiber
  const newChildren = [newElement];
  reconcileChildren(currentFiber, newChildren)
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

  // 把该删除的元素得删掉
  deletions.forEach(commitWork);

  // 从这里可以看到，workInProgressRoot在这里用上了
  // 这个时候的fe指向的是最底层的元素节点
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }

  // 更新完一次就把deletions数组清空
  deletions.length = 0

  // 在遍历构建完真实的DOM之后
  // 把当前的fiber树存起来，赋给currentRoot,为更新做准备
  currentRoot = workInProgressRoot;

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
    // 首先是新增一个真实的DOM节点
    returnDOM.appendChild(currentFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION) {
    returnDOM.removeChild(currentFiber.stateNode)
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.type === ELEMENT_TEXT) {
      // 此时的currentFiber.alternate就是显示在页面上，还没有被改过来的上一次的节点
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text
      }
    } else {
      // 不是文本节点就去更新真实的DOM，但是这个updateDOM只是更新他的属性
      updateDOM(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props)
    }
  }

  // 自己的真实DOM处理完之后，把自己的effectTag清空一下！！！
  currentFiber.effectTag = null;
}




// 每个帧空闲的时候进行执行
requestIdleCallback(workLoop, { timeout: 500 })





export {
  scheduleRoot,
}


