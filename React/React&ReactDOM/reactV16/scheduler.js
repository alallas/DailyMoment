import { TAG_ROOT, ELEMENT_TEXT, TAG_TEXT, PLACEMENT, TAG_HOST, DELETION, UPDATE, TAG_CLASS, TAG_FUNCTION } from "./constants";
import { Update, UpdateQueue } from "./update";
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


// hook相关变量
// 正在工作中的fiber，与上面的不一样，这是工作中的fiber，上面的workInProgressRoot是工作中的root节点
let workInProgressFiber = null;
// hooks索引
let hookIndex = 0;


// 再次进入这个函数是什么时候？？
// 刷新页面或者setState
function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    // 1. 说明已经更新过一次了，是第二次更新

    // 1.1 这个时候直接用初始渲染出来的那个树，把他当做一个新的树
    workInProgressRoot = currentRoot.alternate;
    // 1.2 让新的这个替换过的workInProgressRoot树（相当于一个新的树，其实是之前的旧树currentRoot.alternate）的alternate指向currentRoot旧树（注意：currentRoot存的永远是上一次的树！！）
    workInProgressRoot.alternate = currentRoot;
    // 1.3 替换一下原来的props
    if (rootFiber) {
      workInProgressRoot.props = rootFiber.props;
    }

  } else if (currentRoot) {
    // 2. 说明至少已经渲染过一次了，是第一次更新
    
    // 2.1 新建的情况，rootFiber已经传入了
    if (rootFiber) {
      // 让新的树的一个alternate属性指向旧树对应的节点
      rootFiber.alternate = currentRoot;
      // 更新一下当前正在渲染的树
      workInProgressRoot = rootFiber;
    } else {
      // 2.2 更新的情况，没有传递rootFiber
      // 可以直接复用以前的树的属性，然后alternate指向的是以前的树
      workInProgressRoot = {
        ...currentRoot,
        alternate: currentRoot,
      }
    }

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
  } else if (currentFiber.tag === TAG_FUNCTION) {
    updateFunctionComponent(currentFiber)
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
  // 为了防止类组件的stateNode不是原生的DOM，这里要判断stateNode有没有原生DOM的setAttribute属性
  if (stateNode && stateNode.setAttribute) {
    setProps(stateNode, oldProps, newProps)
  }
}


// 这里面的diff的逻辑是：
// 一一对比，一个位置对应的节点与相同位置的节点进行对比，暂时没有涉及到key的复用
function reconcileChildren(currentFiber, newChildren) {
  // 更新时：
  // 拿到老的currentFiber的大儿子，上一次的旧节点
  // 写在这是因为链表的遍历需要一个外部变量来记住当前的节点
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  // 注意：还要同时把oldFiber的副作用链也要清掉！！因为是新的一次更新，新的副作用链还不知道呢
  // 但每一次更新完之后，都会借由workInProgressRoot函数把副作用链清空了
  if (oldFiber) {
    oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
  }


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

    // 首次新建时 + 更新时：
    // 下面在定义节点的类型，我感觉放在createElement阶段会不会更好，像v15，采用一个变量来定义到底是什么类型的节点会不会更好！！！
    // 后面的感受：放在这里的好处是每次更新的时候，newChild的tag属性都会被更新
    let tag;
    if (newChild && typeof newChild.type === 'function' && newChild.type.prototype.isReactComponent) {
      // 这是一个类组件
      tag = TAG_CLASS

    } else if (newChild && typeof newChild.type === 'function') {
      // 这是一个函数组件
      tag = TAG_FUNCTION

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

    // 新老fiber的type一样，且如果有没用的树，直接复用那颗树，effectTag一致为UPDATE
    if (sameType) {
      // 这种情况
      // 1.要么是第二次更新，有一个额外的没有用的树（第一次渲染的树），可以直接拿来用
      // 2.要么是第一次更新，只有一个oldFiber的树，这个树要拿来对比，不能覆盖掉
      if (oldFiber.alternate) {
        // 说明已经更新过一次了，是第二次往后的更新，拿到的是上上次的没用的树
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.nextEffect = null;
        // 同时还要复用一下：updateQueue，用上一次的旧节点的updateQueue！！
        newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue();
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
          updateQueue: oldFiber.updateQueue || new UpdateQueue(),
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
          updateQueue: new UpdateQueue(),
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
  // 注意，类组件也是作为一个fiber，但是他的stateNode不是一个真实的DOM，而是组件的实例
  // 后面在appendChild的时候，底下的唯一一个div挂不到这个stateNode身上，只能挂到顶层的根节点上面！

  // 首次新建渲染逻辑：
  // 这里不是更新时会走的逻辑，更新时currentFiber.stateNode肯定存在，进不来！
  if (!currentFiber.stateNode) {
    // 创建实例！
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);

    // 搞个双向指针！类组件的实例的一个internalFiber属性指向fiber
    // 1. 目的是让类组件也能拿到fiber，为update提供老fiber的信息
    currentFiber.stateNode.internalFiber = currentFiber;
    // 2. 目的是让currentFiber也能拿到更新器的一些属性和方法。
    currentFiber.updateQueue = new UpdateQueue();
  }

  // 更新的逻辑：
  // 执行forceUpdate，把老状态传给这个函数，原地更新类组件实例的state的属性
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state)
  // 重新执行render函数
  let newElement = currentFiber.stateNode.render();

  // ! 这里是把render的返回值作为孩子去处理，这是一个好思路！！！
  // 因为反观v15版本，类组件首先无论是更新还是新建都会先执行render，然后将render的结果进入更新分发器，而这个分发器最后肯定会回到原生dom的update那边，包括属性的变换和孩子数组的diff，
  // 而在这里v16版本直接调用孩子数组的【新建 + 更新】相结合的reconcileChildren函数，且在函数里面判断类型，然后构建fiber结构，这个fiber结构某种程度上也是一个标记的过程（包括建立自身的真实dom，处理属性，然后处理自己的孩子，以及连接fiber）。标记完之后，一个节点算是处理完成了，然后向下继续处理，处理上一个节点的孩子。（v16版本的核心，一次一个节点为单元，不是传统的递归思路）。减少重复代码！
  // 这些孩子的父亲是currentFiber
  const newChildren = [newElement];
  reconcileChildren(currentFiber, newChildren)
}



function updateFunctionComponent(currentFiber) {
  // 在执行函数之前，为一些变量和属性赋予值，恢复成为初始空值
  workInProgressFiber = currentFiber;
  hookIndex = 0;
  workInProgressFiber.hooks = []; // tag是function形式的fiber才会有这个hooks的属性！

  // 执行函数，递归进入新建或更新
  let newChildren = [currentFiber.type(currentFiber.props)];
  reconcileChildren(currentFiber, newChildren);
}




// effectList和完成顺序是一样的，但是节点比较少
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
  // 拿到父节点
  let returnFiber = currentFiber.return;
  // 但是这个节点有可能是一个类组件
  // 需要一直往上找，一直找到是root或原生或文本节点为止。这个时候的returnFiber的stateNode就是真正的dom元素
  while(returnFiber.tag !== TAG_HOST && returnFiber.tag !== TAG_ROOT && returnFiber.tag !== TAG_TEXT) {
    returnFiber = returnFiber.return;
  }

  // 拿到父亲的真实的DOM节点：
  let returnRealDOM = returnFiber.stateNode;

  if (currentFiber.effectTag === PLACEMENT) {
    // 1. 新增一个真实的DOM节点
    // 但是首先要判断当前的fiber节点是不是一个原生的节点，这个时候的currentFiber肯定不是root，不用判断TAG_ROOT
    // 如果不是原生的节点，需要往下找，并且只需要找大儿子，（因为规定好了类组件的下面只能有一个大儿子），然后把下面的是原生节点挂到父亲身上

    // !但是这里有一个问题：在遍历到这个fiber的时候，类组件的effectTag是替换，但是在这里往后找了第一个节点加入到父亲里面
    // 相当于在处理类组件的fiber的时候把下一个也具有effectTag的节点处理了，下一次遍历到这个div节点的时候，再一次往return里面加孩子（这个时候的returnFiber因为是向上找的也是root），相当于加了两个孩子。
    // 但是浏览器原生的dom会自动去重！对于同一个孩子数组。
    // 这里可以写成遇到class节点就直接return，相当于不处理当前的，这样就不会重复添加或删除。
    // if (currentFiber.tag === TAG_CLASS) {
    //   return;
    // }

    let nextFiber = currentFiber;
    while(nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
      nextFiber = nextFiber.child;
    }
    returnRealDOM.appendChild(nextFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION) {
    // 2. 删除这个真实的DOM节点
    // 也需要判断currentFiber.stateNode是不是一个原生的DOM节点类型，然后往下寻找
    commitDeletion(currentFiber, returnRealDOM)
  } else if (currentFiber.effectTag === UPDATE) {
    // 3. 更新这个真实的DOM节点，节点本身是复用过的，对真实DOM的操作只剩下操作他的属性了！
    if (currentFiber.type === ELEMENT_TEXT) {
      // 此时的currentFiber.alternate就是显示在页面上，还没有被改过来的上一次的节点
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text
      }
    } else {
      // 不是文本节点（而是root或原生host节点）就去更新真实的DOM，但是这个updateDOM只是更新他的属性
      // 因为节点的复用已经实现了在fiber新建的标记那里，其实就是之前的类型一样的节点，只是把属性更新一下就可以
      updateDOM(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props)
    }
  }

  // 自己的真实DOM处理完之后，把自己的effectTag清空一下！！！
  currentFiber.effectTag = null;
}


function commitDeletion(currentFiber, returnRealDOM) {
  if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
    returnRealDOM.removeChild(currentFiber.stateNode)
  } else {
    // 往下寻找
    commitDeletion(currentFiber.child, returnRealDOM)
  }
}


// 每个帧空闲的时候进行执行
requestIdleCallback(workLoop, { timeout: 500 })




// 在执行这个函数之前做的清空（首次渲染/重新更新才会走这三条）
// workInProgressFiber = currentFiber;
// hookIndex = 0;
// workInProgressFiber.hooks = [];

function useReducer(reducer, initialValue) {
  // 找上一次渲染的结果的对应的钩子
  let newHook = workInProgressFiber.alternate && workInProgressFiber.alternate.hooks && workInProgressFiber.alternate.hooks[hookIndex];
  if (newHook) {
    // 这是第一次往后更新（第二次往后渲染）
    // 获得新的合并之后的state，对原来的钩子对象的state执行原地替换，因为从头到尾这个index对应的newHook都是只有一个内存地址
    // 下一次再次进来这个函数的时候，workInProgressFiber是当前的这个fiber，newHook也是存在的，就走到这个条件里面了
    newHook.state = newHook.updateQueue.forceUpdate(newHook.state)

  } else {
    // 这是第一次渲染，没有alternate属性
    newHook = {
      state: initialValue,
      updateQueue: new UpdateQueue(),
    }
  }
  // 在这里，action相当于一个行动记事本，记录要执行的动作类型
  // 这里的dispatch函数相当于setState的逻辑，把新的state传入updater的队列中，然后重新调度。
  // 那什么时候forceUpdate呢，且得到的新的state应该要存到newHook里面的state里面，因为这是return出去的值，是实时会更新的，看上面！

  // 并且：如果是用的setState语法糖的话，这个函数传递进来的直接就是一个新的state，
  const dispatch = (action) => {
    let payload = reducer ? reducer(newHook.state, action) : action;
    newHook.updateQueue.enqueueUpdate(
      new Update(payload)
    )
    scheduleRoot();
  }

  // 1. 保存一下当前的钩子到hooks数组里面。
  // 要把渲染和更新写到一起，一个用于渲染（渲染的需要新建），一个用于更新（更新的需要复用）。
  // 2. 更新一下hookIndex的索引。
  // 因为渲染和更新都是hooks清空了且index为0才走这个函数，如果这个函数有很多次调用，就是在往数组里面加东西，也是推动index++的原因，所以可以直接用数组表示。
  workInProgressFiber.hooks[hookIndex++] = newHook;

  return [newHook.state, dispatch]

}


function useState(initialValue) {
  return useReducer(null, initialValue)
}



// 当前的钩子，替代原来的index的作用
let workInProgressHook;
function useReducer(reducer, initialState) {
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  let newHook = workInProgressFiber.alternate && workInProgressFiber.alternate.hooks && workInProgressFiber.alternate.hooks[hookIndex];
  if (newHook) {
    // 找得到，说明是更新
    // 拿一个变量来记录最新的state
    let baseState = workInProgressHook.state
    if (workInProgressHook.queue.pending) {
      // 说明是批量更新模式
      let firstUpdate = workInProgressHook.queue.pending.next;

      do {
        // *TODO - 更新state，且一直覆盖baseState
        firstUpdate = firstUpdate.nextUpdate
      }
      while(firstUpdate !== workInProgressHook.queue.pending.next)

    }
    // 每次操作完，保证workInProgressHook是当前还没处理过的最新的hook
    // 移动指针到下一个
    workInProgressHook = workInProgressHook.nextHook

  } else {
    // 找不到，说明是渲染
    // newHook找不到就给他直接赋值
    newHook = {
      state: initialState,
      // 用来保存下一个hook，链表保存各个hook
      nextHook: null,
      // setState的链条，用来保存每一次的setState产生的更新器！
      queue: null,
    }
    // 初始化链表
    if (!workInProgressFiber.hooks) {
      // 首次执行为当前fiber开出一个通往hooks链条的开口，赋予一个hooks属性
      workInProgressFiber.hooks = newHook;
    } else {
      // 非首次执行，这个时候的newHook是第二个或往后个，是上一个workInProgressHook的nextHook
      workInProgressHook.nextHook = newHook;
    }
    // 更新当前的指针，移动到下一个
    workInProgressHook = newHook;
  }

}


// 以前的dispatch函数
// const dispatch = (action) => {
//   let payload = reducer ? reducer(newHook.state, action) : action;
//   newHook.updateQueue.enqueueUpdate(
//     new Update(payload)
//   )
//   scheduleRoot();
// }
// 两个参数，一个是update的队列，一个是传入的state或者是reducer的入参
function dispatchState(queue, action) {
  let update = {
    action,
    nextUpdate: null,
  }
  if (!queue.pending) {
    // 首次setState，初始化链表
    update.nextUpdate = update;
  } else {
    // 第二次往后的setState
    // 1. 首先：本次的nextUpdate指向上一次的nextUpdate：
    // 为什么？因为上一次的nextUpdate指向的永远是链表的头
    update.nextUpdate = queue.pending.nextUpdate;
    // 2. 然后再更新上一次的nextUpdate指向当前本次的update
    // 为什么？连接正常顺序的更新器对象
    queue.pending.nextUpdate = update;
  }
  // 更新当前指针，移动到下一个
  queue.pending = update

  // *TODO - 看源码怎么做
  // 要么链表积累到某个程度，要么事件函数触发完毕，就强制调度了
  // setState这里要么在scheduleRoot()执行之前判断能否更新，不能的话return出去，要么就不在这里写scheduleRoot()，等到时间函数结束的时候触发调度

}




export {
  scheduleRoot,
  useReducer,
  useState,
}


