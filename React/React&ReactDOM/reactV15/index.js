import React from "./react/index.js";
import ReactDOM from './react-dom/index.js';
// import React from "react";
// import ReactDOM from 'react-dom'
import Counter from "./Counter.js";

function handleClick(syntheticEvent) {
  console.log(syntheticEvent)
  syntheticEvent.persist()
  setInterval(() => {
    console.log(syntheticEvent)
  }, 2000)
}
let element = React.createElement(
  'button',
  { id: 'sayHello', onClick: (e) => handleClick(e), },
  'say',
  React.createElement('span', { style: { color: 'red' } }, 'Hello')
)


ReactDOM.render(
  element,
  document.getElementById('root')
)


// ReactDOM.render(
//   <Counter />,
//   document.getElementById('root')
// )

