import React from "./react.js";
import Counter from "./components/Counter.js";
import Todo from "./components/Todo.js";

function sayHello() {
  console.log("hello");
}

// 下面其实相当于jsx语法，需要靠babel转化为js
// let element = (
//   <button id="sayHello" style={{ color:'red', backgroundColor: 'green' }} onClick={sayHello}>
//     say
//     <b>
//       Hello
//     </b>
//   </button>
// )

// babel会把上面的语法转化为下面的语法
// createElement的参数是1.元素名字2.属性3.内容
// 其中第一个参数有可能是别的组件，不是原生的dom。如果是原生的dom第一个参数就是一个字符串
const element1 = React.createElement(
  "button",
  {
    id: "sayHello",
    style: { color: "red", backgroundColor: "green" },
    onClick: sayHello,
  },
  "say",
  React.createElement("b", {}, "Hello")
);
// element大概长这样：
// { type: 'button', props: { id: 'sayHello' }, children: [ 'say', { type: 'b', props: {}, children: ['Hello'] } ] }
// 最后render的话，肯定要变成纯纯的html语言，比如：
// <button id="sayHello" style="color:red;background-color:green" onclick="sayHello">
//   <span>say</span>
//   <b>Hello</b>
// </button>



let element2 = React.createElement(Counter, { name: "计数器" });

let element3 = React.createElement(Todo, {});

// import ReactDOM from "react-dom";
// 最早没有react-dom这个库
// 后来有了两个库
// react18版本显示React没有render这个函数，ReactDOM倒是有，但不用了
React.render(element3, document.getElementById("root"));
