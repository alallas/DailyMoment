import { TEXT, ELEMENT, FUNCTION_COMPONENT, CLASS_COMPONENT } from "./constants.js";
import { onlyOne, setProps, flatten } from "./utils.js";

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



export {
  ReactElement,
  createDOM,
}





