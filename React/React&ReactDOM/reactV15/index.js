// import React from "./react/index.js";
// import ReactDOM from './react-dom/index.js';
import React from "react";
import ReactDOM from 'react-dom'
import Counter from "./Counter.js";

function handleClick() {
  console.log('hello')
}


// let element = React.createElement(
//   'button',
//   { id: 'sayHello', onClick: () => handleClick(), },
//   'say',
//   React.createElement('span', { style: { color: 'red' } }, 'Hello')
// )



// ReactDOM.render(
//   <Counter />,
//   document.getElementById('root')
// )

ReactDOM.render(
  <Counter />,
  document.getElementById('root')
)

