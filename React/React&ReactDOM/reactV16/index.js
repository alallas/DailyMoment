import element from "./element";

let container = document.getElementById('root');

// 下一个工作单元，工作单元即fiber
// fiber其实也是一个普通的对象
let nextUnitOfWork = {
  // 此fiber对应的dom节点
  stateNode: container,
  // fiber的属性
  props: {
    children: [
      element,
    ]
  }
};

function workLoop(deadline) {
  // 如果有当前的工作单元，就去执行，然后返回下一个工作单元
  // 目的是直接覆盖一个对象，复用一个对象，减少内存开销
  while(nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
}


// 第一步：beginWork：1.创建此fiber的真实DOM  2.通过虚拟DOM创建fiber树结构

function performUnitOfWork(workingInProgressFiber) {
  // 1.创建真实dom，并没有挂载。2.同时创建fiber子树
  beginWork(workingInProgressFiber);

  // 一开始的workingInProgressFiber没有对应到任何真实的dom上面，算是一个“开始”的节点
  // 首先，有儿子就找儿子【一直探到最底层】
  if (workingInProgressFiber.child) {
    return workingInProgressFiber.child
  }
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

function beginWork(workingInProgressFiber) {
  if (!workingInProgressFiber.stateNode) {
    workingInProgressFiber.stateNode = document.createElement(workingInProgressFiber.type);
    // 附上属性!
    for (let key in workingInProgressFiber.props) {
      if (key !== 'children') {
        workingInProgressFiber.stateNode[key] = workingInProgressFiber.props[key]
      }
    }
  }

}

function completeUnitOfWork(workingInProgressFiber) {

}




// 告诉浏览器在空闲的时候
requestIdleCallback(workLoop);



// 人生而不同，有些人却用一生来害怕自己的不同


