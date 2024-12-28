import React from "./react";
import ReactDOM from "./react-dom";
import ClassCounter from "./components/ClassCounter";
import FunctionCounter from "./components/FunctionCounter";

let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1">C1</div>
      <div id="C2">C2</div>
    </div>
    <div id="B2"></div>
  </div>
);

// let style = { border: '3px solid red', margin: '5px' }
// let c1 = React.createElement('div', { id: 'C1', style }, 'C1')
// let c2 = React.createElement('div', { id: 'C2', style }, 'C2')
// let b1 = React.createElement('div', { id: 'B1', style }, 'B1', c1, c2)
// let b2 = React.createElement('div', { id: 'B2', style }, 'B2')
// let a1 = React.createElement('div', { id: 'A1', style }, 'A1', b1, b2)
// ReactDOM.render(a1, document.getElementById('root'))

// let render2 = document.getElementById('render2')
// render2.addEventListener('click', () => {
//   let c1 = React.createElement('div', { id: 'C1-new', style }, 'C1-new')
//   let c2 = React.createElement('div', { id: 'C2-new', style }, 'C2-new')
//   let b1 = React.createElement('div', { id: 'B1-new', style }, 'B1-new', c1, c2)
//   let b2 = React.createElement('div', { id: 'B2-new', style }, 'B2-new')
//   let b3 = React.createElement('div', { id: 'B3-new', style }, 'B3-new')
//   let a1 = React.createElement('div', { id: 'A1-new', style }, 'A1-new', b1, b2, b3)
//   ReactDOM.render(a1, document.getElementById('root'))
// })

// let render3 = document.getElementById('render3')
// render3.addEventListener('click', () => {
//   let c1 = React.createElement('div', { id: 'C1-new2', style }, 'C1-new2')
//   let c2 = React.createElement('div', { id: 'C2-new2', style }, 'C2-new2')
//   let b1 = React.createElement('div', { id: 'B1-new2', style }, 'B1-new2', c1, c2)
//   let b2 = React.createElement('div', { id: 'B2-new2', style }, 'B2-new2')
//   let a1 = React.createElement('div', { id: 'A1-new2', style }, 'A1-new2', b1, b2)
//   ReactDOM.render(a1, document.getElementById('root'))
// })

ReactDOM.render(
  React.createElement(FunctionCounter, { name: "counter" }),
  document.getElementById("root")
);
