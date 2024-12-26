import React from "react";
import ReactDOM from "react-dom";

let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
)


// 如果节点多，层级特别深
// js是单线程，ui渲染和js执行是互斥的，递归无法结束，调用栈很长
function render(element, parentDOM) {
  // 创建一个真实的DOM
  let dom = document.createElement(element.type);
  // 给真实的dom附上属性
  Object.keys(element.props).filter(key => key !== 'children').forEach(key => {
    dom[key] = element.props[key];
  })
  // 递归遍历孩子节点，这是旧版本很卡顿的关键，递归无法中止暂停！
  // 就算强行暂停了，要恢复也很难，得从头开始
  if(Array.isArray(element.props.children)) {
    element.props.children.forEach(child => render(child, dom))
  }
  parentDOM.appendChild(dom);
}



console.log(JSON.stringify(element, null, 2));
render(element, document.getElementById('root'))


// 总而言之，有两个大问题：不能中断 + 调用栈（执行栈）太深
// fiber解决的问题是：执行栈不能中断的问题！！！







