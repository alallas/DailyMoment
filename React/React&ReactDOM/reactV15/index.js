import React from "./react";
import ReactDOM from "./react-dom";

import EventDemo from "./components/EventDemo.js";
import LifecycleDemo from "./components/LifecycleDemo.js";
import NewLifecycleDemo from "./components/NewLifecycleDemo";
import ScrollingList from "./components/ScrollingList";

import FunctionComponent from "./components/FunctionComponent.js";
import ClassComponent from "./components/ClassComponent.js";

import Counter from "./components/Counter.js";
import List from "./components/List.js";
import Todo from "./components/Todo";

import { FunctionPage, ClassPage } from "./components/Context.js";


// function handleClick(syntheticEvent) {
//   console.log(syntheticEvent)
//   syntheticEvent.persist()
//   setInterval(() => {
//     console.log(syntheticEvent)
//   }, 2000)
// }
// let element = React.createElement(
//   'button',
//   { id: 'sayHello', onClick: (e) => handleClick(e), },
//   'say',
//   React.createElement('span', { style: { color: 'red' } }, 'Hello')
// )

// ReactDOM.render(
//   element,
//   document.getElementById('root')
// )

ReactDOM.render(React.createElement(Todo), document.getElementById("root"));

// let element1 = React.createElement('div', { id: 'classComponent' }, 'hello');
// let element2 = React.createElement(FunctionComponent);
// let element3 = React.createElement(ClassComponent, { id: 'outside' });

// ReactDOM.render(
//   element3,
//   document.getElementById('root')
// )
