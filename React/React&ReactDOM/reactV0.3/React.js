import $ from "jquery";
import { createUnit } from "./unit.js";
import { createElement } from "./element.js";
import Component from "./Component.js";


function render(element, container) {
  // 1. 方便以后定位修改更新，要在外面包裹一个span，给一个自定义属性
  // 定位使用id，Id怎么生成的: 最最祖先的元素是0，两个子元素就是0.0和0.1，以此类推
  // container.innerHTML = `<span data-reactid="${react.rootIndex}">${element}</span>`;

  // 2. 且以后Element不一定是文本节点，很大可能是一个dom节点或者自定义组件
  // 采用工厂模式生产dom的unit单元,unit单元就是【负责把元素转化成可以在html上显示的字符串】
  let unit = createUnit(element);
  // 用来生成html的标记(根节点的rootID是0，这里先直接写死了)
  let markUp = unit.getMarkUp("0");

  // 拿到container，塞上$符号，变成一个对象，用html方法给他设置html内容，同时塞上markUp标记
  $(container).html(markUp);

  // 注意：$(container)生成一个增强版的 DOM 元素对象，有下面的方法
  // .css()：设置样式
  // .html()：获取或设置 HTML 内容
  // .on()：添加事件监听器
  // .addClass()：添加 CSS 类
  // .fadeIn()：使元素渐现

  // 补充！那后面怎么获取这个自定义属性的值呢，两个方法，一个原生的一个是jquery的
  // 原生的：dom.dataset.reactid
  // jquery的：$(dom).data('reactid')

  // 这里触发一下didMount的事件(相当于发布事件)
  $(document).trigger("mounted");
}


let React = {
  render,
  createElement,
  Component,
};

export default React;
