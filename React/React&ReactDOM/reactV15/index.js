import React from "./react/index.js";
import ReactDOM from "./react-dom/index.js";
// import React from "react";
// import ReactDOM from 'react-dom'
// import Demo from "./components/Demo.js";

import FunctionComponent from "./components/FunctionComponent.js";
import ClassComponent from "./components/ClassComponent.js";

import Counter from "./components/Counter.js";
import List from "./components/List.js";

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

ReactDOM.render(React.createElement(List), document.getElementById("root"));

// let element1 = React.createElement('div', { id: 'classComponent' }, 'hello');
// let element2 = React.createElement(FunctionComponent);
// let element3 = React.createElement(ClassComponent, { id: 'outside' });

// ReactDOM.render(
//   element3,
//   document.getElementById('root')
// )
