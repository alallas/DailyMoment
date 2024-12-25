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
  let dom = document.createElement(element.type);
  Object.keys(element.props).filter(key => key !== 'children').forEach(key => {
    dom[key] = element.props[key];
  })
  if(Array.isArray(element.props.children)) {
    element.props.children.forEach(child => render(child, dom))
  }
  parentDOM.appendChild(dom);
}



console.log(JSON.stringify(element, null, 2));
render(element, document.getElementById('root'))



