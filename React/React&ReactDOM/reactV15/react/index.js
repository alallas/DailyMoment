import { TEXT, ELEMENT, FUNCTION_COMPONENT, CLASS_COMPONENT } from "./constants.js";
import { ReactElement } from './vdom.js';
import Component from './Component.js'


function createElement(type, config = {}, ...children) {
  // 编译的时候产生的一些属性，不需要了，直接删除掉
  delete config.__source;
  delete config.__self;

  // debugger
  // 为什么要专门把两个这个属性提取出来，剩下的对象才算是元素的属性？？？？
  // ref是获得dom元素的，是获得组件实例的
  let { key, ref, ...props } = config;


  let $$typeof = null;
  if(typeof type === 'string') {
    $$typeof = ELEMENT;
  } else if (typeof type === 'function' && type.prototype.isReactComponent) {
    // 是一个类组件
    $$typeof = CLASS_COMPONENT;
  } else if (typeof type === 'function') {
    // 是一个函数组件
    $$typeof = FUNCTION_COMPONENT;
  }

  // 这里和v0.3的区别就是，v0.3没有对child进行包装处理而是直接用原始值的字符串，在创建工具集的时候也是直接用的原始值作为输入保存到currentElement里面
  // 这里直接用了$$typeof来表明这是一个文本元素还是一个Element元素，做了包装处理
  props.children = children.map((item) => {
    if (typeof item === 'object') {
      // 这时是一个element实例
      return item
    } else {
      return { $$typeof: TEXT, type: TEXT, content: item }
    }
  })

  // 这里区分一下$$typeof和type，前者表示当前的节点的大类型，也就是他是一个element节点还是一个单纯的文本，后者表示节点的类型，比如是span还是什么div之类的
  // 如果都是文本类型的，两者都是TEXT
  return ReactElement($$typeof, type, key, ref, props)

}


const React = {
  createElement,
  Component,
};

export default React;


