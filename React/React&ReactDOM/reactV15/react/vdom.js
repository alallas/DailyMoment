import { TEXT, ELEMENT, FUNCTION_COMPONENT, CLASS_COMPONENT, MOVE, INSERT, REMOVE } from "./constants.js";
import { onlyOne, setProps, flatten, patchProps } from "./utils.js";

let updateDepth = 0;
let diffQueue = [];

function ReactElement($$typeof, type, key, ref, props) {
  let element = {
    $$typeof, type, key, ref, props,
  }
  return element;
}


// 分发函数，相当于createUnit，属于一个指挥者的角色
function createDOM(element) {
  // 如果传过来的是一个数组，只是取第一个就好？？？？children是一个数组
  // element = onlyOne(element)

  const { $$typeof, type, key, ref, props } = element;
  let dom = null;


  // 第一种情况，element是一个原始值，字符串或者数字，有可能在render执行的时候就渲染一个‘xxx’
  if (!$$typeof) {
    dom = document.createTextNode(element);
  } else if ($$typeof === TEXT) { // 被包装过的文本对象
    dom = document.createTextNode(element.content);
  } else if ($$typeof === ELEMENT) {
    // 这是一个原生的DOM节点，也就是他的type是一个string
    dom = createNativeDOM(element);
  } else if ($$typeof === CLASS_COMPONENT) {
    // 这是一个类组件
    dom = createClassComponent(element);
  } else if ($$typeof === FUNCTION_COMPONENT) {
    // 这是一个函数组件
    dom = createFunctionComponent(element);
  }

  // 挂属性，真实的dom挂到自己的虚拟dom上面
  element.dom = dom;
  return dom;
}

function createClassComponent(element) {
  let { type, props } = element;
  let componentInstance = new type(props);
  let renderElement = componentInstance.render();
  let newDOM = createDOM(renderElement);

  // 开始相互引用（挂属性）
  // 组件形式的虚拟DOM挂上实例属性，以后这个实例是一直不变的（new方法执行的结果）
    // 因为需要获取这个实例里面的state或者是生命周期函数
  // 实例挂上return出来的虚拟dom的属性（render方法执行的结果）
    // 因为属性更新的时候需要重新执行render，需要与上一次（在这里是首次）的render结果进行对比
  element.componentInstance = componentInstance;
  componentInstance.renderElement = renderElement;

  // 这里的目的是在return出来的虚拟dom（createElement函数产生的）上面挂一个dom属性，指向他的真实dom，可以在后面的时候使用
  renderElement.dom = newDOM;

  // 综上，element.componentInstance.renderElement.dom = div的真实dom元素
  // 也就是组件经过包装形成的组件形式的虚拟dom可以拿到类组件实例、render结果、真实dom

  return newDOM;
}


function createFunctionComponent(element) {
  let { type, props } = element; // 这个时候的type是一个function
  let renderElement = type(props); // 这个时候得到的是函数return出来的值，一般是原生的dom节点
  let newDOM = createDOM(renderElement);

  // 开始相互引用（挂属性）
  // 把组件首次render的结果产生的虚拟DOM挂到组件DOM上面
  element.renderElement = renderElement;

  // 这里的目的是在return出来的虚拟dom（createElement函数产生的）上面挂一个dom属性，指向他的真实dom，可以在后面的时候使用
  renderElement.dom = newDOM;

  // 综上，element.renderElement.dom = div的真实dom元素
  // 也就是组件经过包装形成的组件形式的虚拟dom可以拿到函数组件的render结果、真实dom

  return newDOM
}




// 每个产生的小作坊，只负责生产某一类的东西！！
function createNativeDOM(element) {
  const { $$typeof, type, key, ref, props } = element;
  
  // 为当前作为顶层的节点创建一个真实的dom对象（使用原生的方法）
  let dom = document.createElement(type);

  // 然后需要递归处理孩子数组
  createDOMChildren(dom, element.props.children);

  // 添加属性
  setProps(dom, props);

  return dom;
}



function createDOMChildren(parentNode, children) {
  // 注意这里一定要把这个数组展开至只有一维数组，因为在写的时候有可能写成了[<span></span>[<span></span>]]
  children && flatten(children).forEach((child, index) => {

    // 这个child其实是一个经过createElement处理的一个虚拟dom，给他加一个属性，记录本节点在孩子数组中的位置（索引）
    child._mountIndex = index;

    let childDOM = createDOM(child);
    parentNode.appendChild(childDOM);
  })
}


function compareTwoElements(oldRenderElement, newRenderElement) {
  // 首先保证都是单节点！
  oldRenderElement = onlyOne(oldRenderElement);
  newRenderElement = onlyOne(newRenderElement);

  // 先创建两个变量，老的真实dom和虚拟dom，只是为了方便取变量，不用写这么多！
  // 用来进行原地替换当前的新的信息,因为对象都是指向的当前的内存地址，所以替换变量就是替换原本的值
  let currentDOM = oldRenderElement.dom;
  let currentElement = oldRenderElement;

  if (newRenderElement === null) {
    // 如果新节点是null，直接删掉当前的节点，且断开与父节点的联系
    currentDOM.parentNode.removeChild(currentDOM);
    currentDOM = null;

  } else if (oldRenderElement.type !== newRenderElement.type) {
    // 如果两者的类型都变了，那说明需要重新新建一个新的dom，然后原地替换老的
    let newDOM = createDOM(newRenderElement);

    // 虚拟的dom和真实的dom都原地替换一下
    currentDOM.parentNode.replaceChild(newDOM, currentDOM);
    currentElement = newRenderElement;

  } else {
    // 如果两者的类型都一样，只是属性或者内容不一样，就要深度比较了，尽可能复用老节点
    updateElement(oldRenderElement, newRenderElement);

    // 这种情况下，updateElement只是执行了，并没有返回值给到currentElement。
    // 这个时候的currentElement还是oldRenderElement！！
    // updateElement函数里面会对currentElement进行

  }
  return currentElement;
}




function updateElement(oldElement, newElement) {
  // 这个时候只是在forceUpdate重新执行了一遍render方法，newElement上面没有挂上原生dom的属性
  // 目的是复用老的原生dom，让老的dom给到新的dom，不用再重新创建一个原生的dom挂到newELement上面
  // 并且创造一个变量出来，好进行原地替换！！

  // !那为什么写在这个函数里面呢，因为这个函数用来深度对比Element,同时直接修改dom
  // !需要在此之前让dom复用，以致于后面修改dom的时候直接改的是同一个dom的内存地址
  let currentDOM = newElement.dom = oldElement.dom;

  // 首先是文本类型的虚拟DOM，【直接操作原生DOM】，更新一下他们的文本内容
  if (oldElement.$$typeof === TEXT && newElement.$$typeof === TEXT) {
    if (oldElement.content !== newElement.content) {
      currentDOM.textContent = newElement.content;
    }

    // 这是不是应该把老节点的文本的属性覆盖一下？？？为了老元素需要复用的情况？？

  } else if (oldElement.$$typeof === ELEMENT) {
    // 先更新自己的属性和先更新子元素数组都一样，谁先谁后无所谓！
    // 更新一下props属性，【直接对原生的DOM进行操作！】
    updateDOMProperties(currentDOM, oldElement.props, newElement.props)

    // 更新子节点数组，直接对原生的DOM进行操作！
    updateChildrenElements(currentDOM, oldElement.props.children, newElement.props.children)

    // 为了同步属性，会把新虚拟DOM的属性赋给旧虚拟DOM的属性（相当于改变透传进来的oldElement，也就是改变上一个函数的返回值currentElement）
    // 因为在compareTwoElements的最后一种情况里，没有用updateElement的返回值替换其返回值
    // 那其他属性呢，type因为已经判断过了，只有在不一样才走到这里，新老是一样的！！
    // 透传过来的oldELement需要用到的情况是：【复用老节点的时候】，因此主要是【属性】和【文本】上的修改，这里把属性覆盖一下！
    oldElement.props = newElement.props;

  } else if (oldElement.$$typeof === FUNCTION_COMPONENT) {
    updateFunctionComponent(oldElement, newElement)

  } else if (oldElement.$$typeof === CLASS_COMPONENT) {
    updateClassComponent(oldElement, newElement)

  }
  
}


function updateChildrenElements(dom, oldChildrenElements, newChildrenElements) {
  // 记录树的深度，目的是判断什么时候结束，然后统一改变真实的DOM
  updateDepth++;

  // 一、写计划，标记怎么做
  diff(dom, oldChildrenElements, newChildrenElements);
  updateDepth--;

  // 二、执行计划
  // 这个时候整个树遍历完毕，开始真正改变真实的原生DOM
  if (updateDepth === 0) {
    patch(diffQueue);
    diffQueue.length = 0;
  }
}

function diff(parentNode, oldChildrenElements, newChildrenElements) {
  // 1.拿到老节点的映射，保存以便于查找
  let oldChildrenElementsMap = getOldChildrenElementsMap(oldChildrenElements);

  // 2.遍历新数组，标记节点的移动（复用）、新增和删除
  // 2.1找可复用的节点，没有就新建，直接修改当前新孩子数组
  // （newChildrenElements是透传进去的，受到了函数里面的原地修改）
  let newChildrenElementsMap = getNewChildrenElementsMap(oldChildrenElementsMap, newChildrenElements);

  // 2.2标记需要移动、新增的节点
  let lastIndex = 0;
  for (let i = 0; i < newChildrenElements.length; i++) {
    let newChildElement = newChildrenElements[i];
    if (newChildElement) {
      let newKey = newChildElement.key || i.toString();
      let oldChildElement = oldChildrenElementsMap[newKey];
      if (oldChildElement === newChildElement) {
        // 这个时候说明是复用的老节点，接下来要看是否需要移动
        if (oldChildElement._mountIndex < lastIndex) {
          diffQueue.push({
            parentNode,
            type: MOVE,
            fromIndex: oldChildElement._mountIndex,
            toIndex: i,
          });
        }
        lastIndex = Math.max(oldChildElement._mountIndex, lastIndex);
      } else {
        diffQueue.push({
          parentNode,
          type: INSERT,
          toIndex: i,
          dom: createDOM(newChildElement),
        });
      }
      
      // 注意！这是为newChildELement赋予一个属性，因为这是第一次（其实是第二次）遍历新的孩子节点数组
      // 如果是更新的话，没有走过createDOMChildren，是不会有这个属性的！！！
      newChildElement._mountIndex = i;
    }
  }

  // 2.3标记需要删除的节点
  for (let oldKey in oldChildrenElementsMap) {
    if (!newChildrenElementsMap.hasOwnProperty(oldKey)) {
      let oldChildElement = oldChildrenElementsMap[oldKey];
      diffQueue.push({
        parentNode,
        type: REMOVE,
        fromIndex: oldChildElement._mountIndex,
      })
    }
  }
}



function getOldChildrenElementsMap(oldChildrenElements) {
  let oldChildrenElementMap = {};
  for (let i = 0; i < oldChildrenElements.length; i++) {
    let oldKey = oldChildrenElements[i].key || i.toString();
    oldChildrenElementMap[oldKey] = oldChildrenElements[i];
  }
  return oldChildrenElementMap
}


function getNewChildrenElementsMap(oldChildrenElementsMap, newChildrenElements) {
  // 顺便也存一下新孩子元素的虚拟DOM，用来为找需要删除的节点用的！
  let newChildrenElementsMap = {};

  // 1.1找可复用的节点
  for (let i = 0; i < newChildrenElements.length; i++) {
    let newChildElement = newChildrenElements[i];
    if (newChildElement) {
      let newKey = newChildElement.key || i.toString();
      let oldChildElement = oldChildrenElementsMap[newKey];

      // 需要key一样，且type类型也一样才能复用
      if (needDeepCompare(oldChildElement, newChildElement)) {
        // 在这里进行递归，为什么不去compareTwoElements，因为这个的目的地判断类型一不一样，而needDeepCompare已经判断过了

        // 复用这个老节点，用新节点的新内容和新属性更新这个节点
        // 这个时候的老节点是透传进去，可以在里面被直接修改，
        updateElement(oldChildElement, newChildElement);

        // 老节点改完之后直接覆盖新数组的对应的节点
        newChildrenElements[i] = oldChildElement;
      }

      // 注意，这里不像0.3版本，这里没有处理新增节点的逻辑，而是放到了diff里面处理

      // 顺便也存一下新孩子元素的虚拟DOM（要么是复用的改过的老节点，要么是原本自己的节点(也就是需要新增的节点)）
      newChildrenElementsMap[newKey] = newChildrenElements[i];
    }
  }
  return newChildrenElementsMap
}

function needDeepCompare(oldChildElement, newChildElement) {
  // 如果两个都存在，且ELement的类型都一样，就需要进一步深度对比（就是复用了！）
  if (!!oldChildElement && !!newChildElement) {
    return oldChildElement.type === newChildElement.type
  }
  return false;
}

// 原生的DOM操作
function patch(diffQueue) {
  // 缓存移动的节点（后面要复用的），且收集要删除的节点
  let deleteMap = {};
  let deleteChildren = [];
  for (let i = 0; i < diffQueue.length; i++) {
    let { type, fromIndex, parentNode } = diffQueue[i];
    if (type === MOVE || type === REMOVE) {
      // 这是原生的DOM的方法，通过他的父亲原生DOM找到当前的这个要删除的孩子原生DOM
      let oldChildDOM = parentNode.children[fromIndex];
      // 缓存与收集
      deleteMap[fromIndex] = oldChildDOM;
      deleteChildren.push(oldChildDOM);
    }
  }
  // 删除所有的收集起来的要删除的节点
  deleteChildren.forEach((childDOM) => {
    childDOM.parentNode.removeChild(childDOM);
  });
  for (let i = 0; i < diffQueue.length; i++) {
    let { type, fromIndex, toIndex, parentNode, dom } = diffQueue[i];
    switch (type) {
      case INSERT:
        insertChildAt(parentNode, dom, toIndex);
        break;
      case MOVE:
        insertChildAt(parentNode, deleteMap[fromIndex], toIndex);
        break;
      default:
        break;
    }
  }
}

function insertChildAt(parentNode, newchildDOM, index) {
  // 先拿出这个节点的老节点
  let oldChild = parentNode.children[index];
  oldChild ? parentNode.insertBefore(newchildDOM, oldChild) : parentNode.appendChild(newchildDOM);
}



function updateClassComponent(oldElement, newElement) {
  // 实例不用再新建一个，不然state就被重置了，需要拿到老的实例！！！！！！
  let componentInstance = oldElement.componentInstance;

  // 拿到实例的更新器对象
  let updater = componentInstance.$updater;
  // 拿到新的属性对象
  let nextProps = newElement.props;
  // 直接试图更新，但是这里不需要把state保存起来
  // 实际上这个试图更新的函数最后肯定强制更新，因为nextPrpos即使没有也是{}，当前的isPending是默认的false，也肯定会进去updateComponent，
  // 然后去到forceUpdate，然后执行render方法得到新的renderELement，再进入compareTwoElements递归
  updater.emitUpdate(nextProps);
}



// 这里的逻辑和createFunctionComponent其实差不多
// 需要执行这个函数本身，然后拿到新的一个return出来的原生虚拟DOM，
// 然后进入compareTwoElements递归
function updateFunctionComponent(oldElement, newElement) {

  // 为什么在这里要拿到这里面的renderElement属性，因为这个入参是一个函数组件类型的虚拟DOM，要挖出里面存的return出来的native虚拟dom来更深一步地比较
  // 相当于在向下层进行递归
  let oldRenderElement = oldElement.renderElement;
  let newRenderElement = newElement.type(newElement.props);
  let currentElement = compareTwoElements(oldRenderElement, newRenderElement);

  // 记得需要重新替换一下这个render属性（就像在createFunctionComponent里面实现的那样）
  newElement.renderElement = currentElement;

  // 其实不用return也可以！没用到返回值
  return currentElement;
}



function updateDOMProperties(dom, oldProps, newProps) {
  patchProps(dom, oldProps, newProps);
}



export {
  ReactElement,
  createDOM,
  compareTwoElements,
}





