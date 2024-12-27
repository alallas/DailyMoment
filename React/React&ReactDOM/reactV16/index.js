import React from "./react";
import ReactDOM from './react-dom'

let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1">C1</div>
      <div id="C2">C2</div>
    </div>
    <div id="B2"></div>
  </div>
)

let style = { border: '3px solid red', margin: '5px' }
let c1 = React.createElement('div', { id: 'C1', style }, 'C1')
let c2 = React.createElement('div', { id: 'C2', style }, 'C2')
let b1 = React.createElement('div', { id: 'B1', style }, 'B1', c1, c2)
let b2 = React.createElement('div', { id: 'B2', style }, 'B2')
let a1 = React.createElement('div', { id: 'A1', style }, 'A1', b1, b2)


ReactDOM.render(a1, document.getElementById('root'))

console.log(a1)


