// import React from "./react/index.js";
import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }


  // 在这里，tick的event是undefined，这个传不过来，也就是说，event不支持传递
  // 为什么event不支持传递？？？？
  // 因为是执行完listener函数之后，就把合成事件对象的所有属性都变为null了，在这个版本是直接删除了，所以就是undefined
  // 但是listener函数不应该是把handleClick里面的所有函数体全部执行吗？？？tick不是也属于这个listener函数的一部分吗？
  tick(event) {
    setInterval(() => {
      console.log(event);
    }, 1000)
  }


  handleClick = (event) => {
    console.log(event);
    this.tick(event)
  }


  render() {
    // 实际上，下面的写法等于返回React.createElement(xxxxx)

    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    );

    
    // let p = React.createElement('p', {}, this.state.number)
    // let button = React.createElement('button', { onClick: () => this.handleClick() }, '+')
    // return React.createElement('div', {}, p, button)

  }
}

export default Counter;
