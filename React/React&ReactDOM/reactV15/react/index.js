import {
  TEXT,
  ELEMENT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
} from "./constants.js";
import { ReactElement } from "./vdom.js";
import { Component } from "./component.js";
import { onlyOne, flatten } from "./utils.js";

function createElement(type, config = {}, ...children) {
  // 编译的时候产生的一些属性，不需要了，直接删除掉
  delete config.__source;
  delete config.__self;

  // debugger
  // 为什么要专门把两个这个属性提取出来，剩下的对象才算是元素的属性？？？？
  // ref是获得dom元素的，是获得组件实例的
  let { key, ref, ...props } = config;

  let $$typeof = null;
  if (typeof type === "string") {
    $$typeof = ELEMENT;
  } else if (typeof type === "function" && type.prototype.isReactComponent) {
    // 是一个类组件
    $$typeof = CLASS_COMPONENT;
  } else if (typeof type === "function") {
    // 是一个函数组件
    $$typeof = FUNCTION_COMPONENT;
  }

  // 这里和v0.3的区别就是，v0.3没有对child进行包装处理而是直接用原始值的字符串，在创建工具集的时候也是直接用的原始值作为输入保存到currentElement里面
  // 这里直接用了$$typeof来表明这是一个文本元素还是一个Element元素，做了包装处理

  // 以防万一，把children做打平处理
  // 这是创造children的启动点，写在这里比较合适
  // 打平的意义在于：写jsx的时候，map生成一个新的数组，也就是children本来就是一个数组，然后再用一个（参数的）数组包裹就是二维数组了！

  children = flatten(children);
  props.children = children.map((item) => {
    if (typeof item === "object" || typeof item === "function") {
      // 这时是一个element实例
      return item;
    } else {
      return { $$typeof: TEXT, type: TEXT, content: item };
    }
  });

  // 这里区分一下$$typeof和type，前者表示当前的节点的大类型，也就是他是一个element节点还是一个单纯的文本，后者表示节点的类型，比如是span还是什么div之类的
  // 如果都是文本类型的，两者都是TEXT
  return ReactElement($$typeof, type, key, ref, props);
}

function createRef() {
  return { current: null };
}

function createContext(defaultValue) {
  Provider.value = defaultValue;

  // ! 用两个函数组件
  // 返回的是自己本身的孩子，是一个数组，也就是他只是起到一个【包裹作用】
  // ! 这个数组在后面的createDOM处理中会被onlyOne处理为只剩下第一个元素？？那其他元素怎么办？？？
  // 所以provider后面必须传递一个外表的<div>，然后才能写里面的。也就是说Provider的children只能有一个
  function Provider(props) {
    Provider.value = props.value;
    return props.children;
  }

  // 下面的props的children是一个函数
  // 为了防止是一个数组，只取其中第一个onlyOne
  // 因为夺取者
  function Consumer(props) {
    return onlyOne(props.children)(Provider.value);
  }

  return { Provider, Consumer };
}

const React = {
  createElement,
  Component,
  createRef,
  createContext,
};

export default React;

export { Component };
