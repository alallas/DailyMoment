import { TEXT, ELEMENT } from "./constants.js";
import { onlyOne, setProps } from "./utils.js";

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
    dom = createNativeDOM(element);
  }
  return dom;
}

// 每个产生的小作坊，只负责生产某一类的东西！！
function createNativeDOM(element) {
  const { $$typeof, type, key, ref, props } = element;

  console.log('type', type)
  
  // 为当前作为顶层的节点创建一个真实的dom对象（使用原生的方法）
  let dom = document.createElement(type);

  // 然后需要递归处理孩子数组
  createNativeDOMChildren(dom, element.props.children);

  // 添加属性
  setProps(dom, props);

  return dom;
}


function createNativeDOMChildren(parentNode, children) {
  // 注意这里一定要把这个数组展开至只有一维数组，因为在写的时候有可能写成了[<span></span>[<span></span>]]
  children && children.flat(Infinity).forEach((child) => {
    let childDOM = createDOM(child);
    parentNode.appendChild(childDOM);
  })
}



export {
  ReactElement,
  createDOM,
}





